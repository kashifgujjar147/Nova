import mongoose from "mongoose";
import {Withdrawal,Affiliate,User} from "../models";
import {record} from "./audit.service";

const fail=(m:string,s=400)=>Object.assign(new Error(m),{status:s});

const methods=["EASYPAISA","JAZZCASH","BANK_TRANSFER"] as const;
type WithdrawalMethod=typeof methods[number];
const statuses=["PENDING","APPROVED","REJECTED","PAID"] as const;

function cleanMethod(value:any):WithdrawalMethod{
  const v=String(value||"").toUpperCase() as WithdrawalMethod;
  if(!methods.includes(v))throw fail("Invalid withdrawal method",400);
  return v;
}

export async function mine(userId:string){
  return Withdrawal.find({affiliate:userId}).sort({createdAt:-1}).limit(100);
}

export async function requestWithdrawal(userId:string,d:any){
  const amount=Number(d.amount);
  if(!Number.isFinite(amount)||amount<=0)throw fail("Withdrawal amount must be greater than zero");
  const method=cleanMethod(d.method);
  if(method==="BANK_TRANSFER"&&!String(d.bankName||"").trim())throw fail("Bank name is required for bank transfer");
  const session=await mongoose.startSession();
  let out:any;
  try{
    await session.withTransaction(async()=>{
      const a:any=await Affiliate.findOne({user:userId,active:true}).session(session);
      if(!a)throw fail("Affiliate account not found",404);
      const available=Number(a.availableBalance||0);
      if(amount>available)throw fail(`Insufficient available commission balance. Available: ${available.toFixed(2)}`,409);
      const pending:any=await Withdrawal.findOne({
        affiliate:userId,
        status:{$in:["PENDING","APPROVED"]}
      }).session(session);
      if(pending&&Number(pending.amount||0)+amount>available)
        throw fail("Another withdrawal is already reserving part of your available balance",409);

      a.availableBalance=Number((available-amount).toFixed(2));
      a.withdrawalReservedBalance=Number((Number(a.withdrawalReservedBalance||0)+amount).toFixed(2));
      await a.save({session});

      out=(await Withdrawal.create([{
        affiliate:userId,
        amount:Number(amount.toFixed(2)),
        method,
        accountTitle:String(d.accountTitle||"").trim(),
        accountNumber:String(d.accountNumber||"").trim(),
        bankName:method==="BANK_TRANSFER"?String(d.bankName||"").trim():undefined,
        note:d.note?String(d.note).trim():undefined,
        status:"PENDING",
        requestedAt:new Date()
      }],{session}))[0];

      await record(userId,"WITHDRAWAL_REQUESTED","Withdrawal",out._id.toString(),{
        amount:out.amount,method
      },undefined,session);
    });
    return out;
  }finally{await session.endSession();}
}

export async function listAdmin(q:any={}){
  const filter:any={};
  const status=String(q.status||"").toUpperCase();
  if(status&&statuses.includes(status as any))filter.status=status;
  const items=await Withdrawal.find(filter)
    .populate("affiliate","name email phone")
    .populate("reviewedBy","name email")
    .populate("paidBy","name email")
    .sort({createdAt:-1})
    .limit(500);
  return items;
}

export async function transition(id:string,status:string,actor:string,note?:string,paymentReference?:string){
  const next=String(status||"").toUpperCase();
  if(!statuses.includes(next as any))throw fail("Invalid withdrawal status");
  const session=await mongoose.startSession();
  let out:any;
  try{
    await session.withTransaction(async()=>{
      const w:any=await Withdrawal.findById(id).session(session);
      if(!w)throw fail("Withdrawal not found",404);
      const a:any=await Affiliate.findOne({user:w.affiliate,active:true}).session(session);
      if(!a)throw fail("Affiliate account not found",404);

      const fromStatus=w.status;
      if(next==="APPROVED"){
        if(w.status!=="PENDING")throw fail(`Withdrawal cannot be approved from ${w.status}`,409);
        w.status="APPROVED";
        w.adminNote=note||w.adminNote;
        w.reviewedAt=new Date();
        w.reviewedBy=actor;
      }else if(next==="REJECTED"){
        if(!["PENDING","APPROVED"].includes(w.status))throw fail(`Withdrawal cannot be rejected from ${w.status}`,409);
        w.status="REJECTED";
        w.adminNote=note||w.adminNote;
        w.reviewedAt=new Date();
        w.reviewedBy=actor;
        const amount=Number(w.amount||0);
        a.withdrawalReservedBalance=Math.max(0,Number(a.withdrawalReservedBalance||0)-amount);
        a.availableBalance=Number((Number(a.availableBalance||0)+amount).toFixed(2));
        await a.save({session});
      }else if(next==="PAID"){
        if(w.status!=="APPROVED")throw fail("Only approved withdrawals can be marked paid",409);
        const ref=String(paymentReference||"").trim();
        if(!ref)throw fail("Payment reference is required when marking a withdrawal paid");
        w.status="PAID";
        w.paymentReference=ref;
        w.adminNote=note||w.adminNote;
        w.paidAt=new Date();
        w.paidBy=actor;
        const amount=Number(w.amount||0);
        a.withdrawalReservedBalance=Math.max(0,Number(a.withdrawalReservedBalance||0)-amount);
        a.withdrawnAmount=Number((Number(a.withdrawnAmount||0)+amount).toFixed(2));
        await a.save({session});
      }else if(next==="PENDING"){
        throw fail("Withdrawal cannot be moved back to pending",409);
      }

      out=await w.save({session});
      await record(actor,"WITHDRAWAL_"+next,"Withdrawal",w._id.toString(),{
        amount:w.amount,from:fromStatus,to:next,note,paymentReference
      },undefined,session);
    });
    return out;
  }finally{await session.endSession();}
}
