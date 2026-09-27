import mongoose from "mongoose";import crypto from "crypto";
import {Payment,Order,PaymentMethod,Notification,Upload,User} from "../models";
import {createForOrder,reverseCommission} from "./commissions.service";import {record} from "./audit.service";import {roundMoney} from "../utils/money";
const fail=(m:string,s=400)=>Object.assign(new Error(m),{status:s});
export async function submit(userId:string,d:any,idempotencyKey?:string){const idempotencyFingerprint=idempotencyKey?crypto.createHash("sha256").update(JSON.stringify({order:d.order,method:d.method,amount:roundMoney(Number(d.amount)),transactionId:d.transactionId||null,receiptUrl:d.receiptUrl||null})).digest("hex"):undefined;const session=await mongoose.startSession();let p:any;try{await session.withTransaction(async()=>{if(idempotencyKey){const prior:any=await Payment.findOne({user:userId,idempotencyKey}).session(session);if(prior){if(prior.idempotencyFingerprint&&prior.idempotencyFingerprint!==idempotencyFingerprint)throw fail("Idempotency key was already used for a different payment request",409);p=prior;return;}}const o:any=await Order.findOne({_id:d.order,user:userId}).session(session);if(!o)throw fail("Order not found",404);if(["REFUNDED","CANCELLED","COMPLETED"].includes(o.status))throw fail("Order cannot accept payment",409);const m:any=await PaymentMethod.findOne({_id:d.method,active:true}).session(session);if(!m)throw fail("Payment method unavailable",400);if(roundMoney(Number(d.amount))!==roundMoney(Number(o.total)))throw fail("Payment amount does not match order total",400);if(m.requiresTransactionId&&!d.transactionId)throw fail("Transaction ID is required",400);if(m.requiresReceipt&&!d.receiptUrl)throw fail("Payment receipt is required",400);if(d.receiptUrl){const match=String(d.receiptUrl).match(/\/uploads\/([a-f\d]{24})$/i);if(!match)throw fail("Receipt must be uploaded through the secure upload endpoint",400);const upload:any=await Upload.findOne({_id:match[1],kind:"PAYMENT_RECEIPT",owner:userId}).session(session);if(!upload)throw fail("Receipt upload is not authorized",403);}if(m.type==="COD"&&(d.transactionId||d.receiptUrl))throw fail("COD does not accept transaction details",400);if(await Payment.findOne({order:o._id,status:{$in:["PENDING","UNDER_REVIEW","APPROVED"]}}).session(session))throw fail("An active payment already exists",409);const status=m.type==="COD"?"PENDING":(m.requiresManualReview?"UNDER_REVIEW":"PENDING");p=(await Payment.create([{order:o._id,user:userId,method:m._id,amount:roundMoney(d.amount),transactionId:d.transactionId,paymentTime:d.paymentTime||new Date(),receiptUrl:d.receiptUrl,note:d.note,status,idempotencyKey,idempotencyFingerprint}],{session}))[0];if(status==="UNDER_REVIEW"){o.status="PAYMENT_REVIEW";o.statusHistory.push({status:"PAYMENT_REVIEW",at:new Date(),actor:userId});await o.save({session});}await Notification.create([{user:userId,type:"PAYMENT_SUBMITTED",title:"Payment submitted",message:`Payment for ${o.orderNumber} is ${status.toLowerCase().replace("_"," ")}.`,data:{orderId:o._id,paymentId:p._id}}],{session});const admins:any[]=await User.find({role:{$in:["admin","super_admin"]},active:true}).select("_id").session(session);if(admins.length&&status==="UNDER_REVIEW")await Notification.create(admins.map(a=>({user:a._id,type:"PAYMENT_REVIEW_REQUIRED",title:"Payment verification required",message:`Payment for ${o.orderNumber} is awaiting review.`,data:{orderId:o._id,paymentId:p._id}})),{session});await record(userId,"PAYMENT_SUBMITTED","Payment",p._id.toString(),{orderId:o._id.toString(),method:m.name},undefined,session);});return p}catch(e:any){if(e?.code===11000&&idempotencyKey){const prior:any=await Payment.findOne({user:userId,idempotencyKey});if(prior){if(prior.idempotencyFingerprint&&prior.idempotencyFingerprint!==idempotencyFingerprint)throw fail("Idempotency key was already used for a different payment request",409);return prior;}}throw e}finally{await session.endSession();}}
export async function approvePayment(id:string,actor:string){return review(id,actor,"APPROVED");}
export async function review(id:string,actor:string,status:"APPROVED"|"REJECTED",note?:string){const session=await mongoose.startSession();let p:any;try{await session.withTransaction(async()=>{p=await Payment.findById(id).session(session);if(!p)throw fail("Payment not found",404);const method:any=await PaymentMethod.findById(p.method).session(session);if(!method)throw fail("Payment method not found",404);if(method.type==="COD" && status==="APPROVED")throw fail("COD must be collected through the COD collection flow after delivery",409);const transitions:any={PENDING:["APPROVED","REJECTED"],UNDER_REVIEW:["APPROVED","REJECTED"],REJECTED:["UNDER_REVIEW"]};if(!transitions[p.status]?.includes(status))throw fail(`Invalid payment transition ${p.status} -> ${status}`,409);const o:any=await Order.findById(p.order).session(session);if(!o)throw fail("Order not found",404);if(roundMoney(p.amount)!==roundMoney(o.total))throw fail("Payment amount no longer matches order",409);p.status=status;p.reviewedBy=actor;p.reviewedAt=new Date();p.note=note;p=await p.save({session});if(status==="APPROVED"){o.paymentStatus="APPROVED";if(["PAYMENT_REVIEW","PENDING"].includes(o.status)){o.status="PAYMENT_APPROVED";o.statusHistory.push({status:"PAYMENT_APPROVED",at:new Date(),actor});}await o.save({session});await createForOrder(o._id.toString(),session);}else{o.paymentStatus="REJECTED";if(o.status==="PAYMENT_REVIEW"){o.status="PENDING";o.statusHistory.push({status:"PENDING",at:new Date(),actor});}await o.save({session});}await Notification.create([{user:o.user,type:status==="APPROVED"?"PAYMENT_APPROVED":"PAYMENT_REJECTED",title:`Payment ${status.toLowerCase()}`,message:`Payment for ${o.orderNumber} was ${status.toLowerCase()}.`,data:{orderId:o._id,paymentId:p._id}}],{session});await record(actor,"PAYMENT_"+status,"Payment",p._id.toString(),{orderId:o._id.toString(),note},undefined,session);});return p}finally{await session.endSession();}}
export async function refund(id:string,actor:string){const session=await mongoose.startSession();let p:any;try{await session.withTransaction(async()=>{p=await Payment.findById(id).session(session);if(!p)throw fail("Payment not found",404);if(p.status==="REFUNDED"){return;}if(p.status!=="APPROVED")throw fail("Only approved payments can be fully refunded",409);const o:any=await Order.findById(p.order).session(session);if(!o)throw fail("Order not found",404);if(o.status==="REFUNDED")throw fail("Order already refunded",409);const {restore}=await import("./inventory.service");for(const item of o.items){await restore(item.product.toString(),item.quantity,actor,"CUSTOMER_REFUND","REFUND",o._id.toString(),item.variantId?.toString(),item.sku,"Full payment refund",session);}p.status="REFUNDED";p.reviewedBy=actor;p.reviewedAt=new Date();await p.save({session});o.paymentStatus="REFUNDED";o.status="REFUNDED";o.refundedAt=new Date();o.statusHistory.push({status:"REFUNDED",at:new Date(),actor});await o.save({session});await reverseCommission(o._id.toString(),"Full order refund",actor,session);await Notification.create([{user:o.user,type:"REFUND",title:"Order refunded",message:`Order ${o.orderNumber} has been fully refunded.`,data:{orderId:o._id}}],{session});await record(actor,"REFUND","Payment",p._id.toString(),{orderId:o._id.toString(),fullRefund:true},undefined,session);});return p}finally{await session.endSession();}}

export async function collectCOD(id:string,actor:string){
 const session=await mongoose.startSession(); let p:any;
 try{await session.withTransaction(async()=>{
  p=await Payment.findById(id).populate("method").session(session);
  if(!p)throw fail("Payment not found",404);
  if((p.method as any)?.type!=="COD")throw fail("Only COD payments can be collected through this action",409);
  if(p.status!=="PENDING")throw fail(`COD payment is already ${p.status.toLowerCase()}`,409);
  const o:any=await Order.findById(p.order).session(session);
  if(!o)throw fail("Order not found",404);
  if(!["DELIVERED","COMPLETED"].includes(o.status))throw fail("COD can only be collected after delivery",409);
  p.status="APPROVED"; p.reviewedBy=actor; p.reviewedAt=new Date(); await p.save({session});
  o.paymentStatus="APPROVED"; if(o.status==="DELIVERED"){o.status="COMPLETED";o.statusHistory.push({status:"COMPLETED",at:new Date(),actor});} await o.save({session});
  await createForOrder(o._id.toString(),session);
  await Notification.create([{user:o.user,type:"COD_COLLECTED",title:"Cash on delivery collected",message:`COD for ${o.orderNumber} was collected and approved.`,data:{orderId:o._id,paymentId:p._id}}],{session});
  await record(actor,"COD_COLLECTED","Payment",p._id.toString(),{orderId:o._id.toString()},undefined,session);
 }); return p;}finally{await session.endSession();}
}
export const list=(f:any={})=>Payment.find(f).populate("order user method").sort({createdAt:-1});

export async function submitGuest(
  guestTokenHash:string,
  d:any,
  idempotencyKey?:string
){
  const session=await mongoose.startSession();
  let p:any;

  try{
    await session.withTransaction(async()=>{
      const fingerprint=idempotencyKey
        ?crypto.createHash("sha256")
          .update(JSON.stringify({
            order:d.order,
            method:d.method,
            amount:roundMoney(Number(d.amount)),
            transactionId:d.transactionId||null,
            receiptUrl:d.receiptUrl||null
          }))
          .digest("hex")
        :undefined;

      if(idempotencyKey){
        const prior:any=await Payment.findOne({
          guestTokenHash,
          idempotencyKey
        }).session(session);

        if(prior){
          if(
            prior.idempotencyFingerprint &&
            prior.idempotencyFingerprint!==fingerprint
          )
            throw fail(
              "Idempotency key was already used for a different payment request",
              409
            );

          p=prior;
          return;
        }
      }

      const o:any=await Order.findOne({
        _id:d.order,
        guestTokenHash
      }).session(session);

      if(!o)throw fail("Order not found",404);

      if(["REFUNDED","CANCELLED","COMPLETED"].includes(o.status))
        throw fail("Order cannot accept payment",409);

      const m:any=await PaymentMethod.findOne({
        _id:d.method,
        active:true
      }).session(session);

      if(!m)throw fail("Payment method unavailable",400);

      if(
        roundMoney(Number(d.amount))!==roundMoney(Number(o.total))
      )
        throw fail("Payment amount does not match order total",400);

      if(m.requiresTransactionId&&!d.transactionId)
        throw fail("Transaction ID is required",400);

      if(m.requiresReceipt&&!d.receiptUrl)
        throw fail(
          "This payment method requires a receipt. Please login to upload the receipt securely.",
          400
        );

      if(m.type==="COD"&&(d.transactionId||d.receiptUrl))
        throw fail("COD does not accept transaction details",400);

      if(await Payment.findOne({
        order:o._id,
        status:{$in:["PENDING","UNDER_REVIEW","APPROVED"]}
      }).session(session))
        throw fail("An active payment already exists",409);

      const status=
        m.type==="COD"
          ?"PENDING"
          :(m.requiresManualReview?"UNDER_REVIEW":"PENDING");

      p=(await Payment.create([{
        order:o._id,
        guestTokenHash,
        method:m._id,
        amount:roundMoney(d.amount),
        transactionId:d.transactionId,
        paymentTime:d.paymentTime||new Date(),
        receiptUrl:d.receiptUrl,
        note:d.note,
        status,
        idempotencyKey,
      }],{session}))[0];

      if(status==="UNDER_REVIEW"){
        o.status="PAYMENT_REVIEW";
        o.statusHistory.push({
          status:"PAYMENT_REVIEW",
          at:new Date()
        });
        await o.save({session});
      }

      const admins:any[]=await User.find({
        role:{$in:["admin","super_admin"]},
        active:true
      }).select("_id").session(session);

      if(admins.length&&status==="UNDER_REVIEW"){
        await Notification.create(
          admins.map(a=>({
            user:a._id,
            type:"PAYMENT_REVIEW_REQUIRED",
            title:"Guest payment verification required",
            message:`Payment for ${o.orderNumber} is awaiting review.`,
            data:{orderId:o._id,paymentId:p._id}
          })),
          {session}
        );
      }
    });

    return p;
  }finally{
    await session.endSession();
  }
}


