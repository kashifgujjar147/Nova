import mongoose from "mongoose";
import { Order, Product, InventoryTransaction, Commission, Affiliate, Payment, Notification, AffiliateConversion } from "../models";
const transitions:any={PENDING:["PAYMENT_REVIEW","PAYMENT_APPROVED","CANCELLED"],PAYMENT_REVIEW:["PAYMENT_APPROVED","PENDING","CANCELLED"],PAYMENT_APPROVED:["PROCESSING","CANCELLED"],PROCESSING:["PACKED","CANCELLED"],PACKED:["SHIPPED"],SHIPPED:["IN_TRANSIT"],IN_TRANSIT:["DELIVERED"],DELIVERED:["COMPLETED"],COMPLETED:[],CANCELLED:[],REFUNDED:[]};
const fail=(m:string,s=400)=>Object.assign(new Error(m),{status:s});
export const mine=(user:string)=>Order.find({user}).populate("paymentMethod").sort({createdAt:-1});
export const get=(id:string,user?:string)=>Order.findOne({_id:id,...(user?{user}:{})}).populate("paymentMethod user");
export const list=(f:any={})=>Order.find(f).populate("user paymentMethod affiliateUser").sort({createdAt:-1});
import {reverseCommission} from "./commissions.service";import {record} from "./audit.service";
export async function status(id:string,s:string,actor:string,role?:string){
 const session=await mongoose.startSession();let o:any;try{await session.withTransaction(async()=>{
  o=await Order.findOne({_id:id,...(role&&["admin","super_admin"].includes(role)?{}:{user:actor})}).session(session);if(!o)throw fail("Order not found",404);if(!transitions[o.status]?.includes(s))throw fail(`Invalid order transition ${o.status} -> ${s}`,409);
  if(s==="CANCELLED"){
   if(["DELIVERED","COMPLETED","REFUNDED"].includes(o.status))throw fail("Order cannot be cancelled at this stage",409);
   if(o.paymentStatus==="APPROVED")throw fail("Paid orders must use the refund flow before cancellation",409);
   const {restore}=await import("./inventory.service"); for(const item of o.items){await restore(item.product.toString(),item.quantity,actor,"ORDER_CANCELLATION","CANCELLATION",o._id.toString(),item.variantId?.toString(),item.sku,"Order cancellation",session);}
   o.cancelledAt=new Date();await Payment.updateMany({order:o._id,status:{$in:["PENDING","UNDER_REVIEW"]}},{$set:{status:"REJECTED",note:"Order cancelled"}},{session});await reverseCommission(o._id.toString(),"Order cancellation",actor,session);
  }
  const before=o.status;o.status=s;o.statusHistory.push({status:s,at:new Date(),actor});o=await o.save({session});await record(actor,"ORDER_STATUS","Order",o._id.toString(),{before,after:s},undefined,session);await Notification.create([{user:o.user,type:"ORDER_STATUS",title:"Order updated",message:`Order ${o.orderNumber} is now ${s.replaceAll("_"," ").toLowerCase()}.`,data:{orderId:o._id,status:s}}],{session});
 });return o}finally{await session.endSession();}}

export const getGuest=(id:string,guestTokenHash:string)=>
  Order.findOne({
    _id:id,
    guestTokenHash
  }).populate("paymentMethod");
