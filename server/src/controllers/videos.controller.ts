import * as s from "../services/videos.service";import{ok}from"../utils/response";import{record}from"../services/audit.service";
export const list=async(_q:any,r:any)=>ok(r,await s.list());export const all=async(_q:any,r:any)=>ok(r,await s.all());
export const create=async(q:any,r:any)=>{const x=await s.create(q.body);await record(q.user.id,"CREATE","PromoVideo",x._id.toString());return ok(r,x,"Created",201)};
export const update=async(q:any,r:any)=>{const x=await s.update(q.params.id,q.body);await record(q.user.id,"UPDATE","PromoVideo",q.params.id);return ok(r,x)};
export const remove=async(q:any,r:any)=>{const x=await s.remove(q.params.id);await record(q.user.id,"DELETE","PromoVideo",q.params.id);return ok(r,x)};