import * as s from '../services/delivery.service';import{ok}from'../utils/response';
export const get=async(q:any,r:any)=>{const d=await s.get(q.params.orderId,q.user.id,q.user.role);if(!d)return r.status(404).json({success:false,message:"Delivery not found"});return ok(r,d)};
export const upsert=async(q:any,r:any)=>ok(r,await s.upsert(q.params.orderId,q.body,q.user.id));
export const list=async(_q:any,r:any)=>ok(r,await s.list());

export const confirm=async(q:any,r:any)=>{const d=await s.get(q.params.orderId,q.user.id,q.user.role);if(!d)return r.status(404).json({success:false,message:"Delivery not found"});if(!["DELIVERED"].includes(d.status))return r.status(409).json({success:false,message:"Delivery must be marked delivered before recipient confirmation"});return ok(r,await s.upsert(q.params.orderId,{recipientName:q.body.recipientName,signatureFileId:q.body.signatureFileId,notes:q.body.notes,recipientConfirmedAt:new Date()},q.user.id));};
