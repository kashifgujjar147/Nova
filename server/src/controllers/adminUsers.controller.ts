import * as s from "../services/admin-users.service";import{ok}from"../utils/response";import{record}from"../services/audit.service";
export const list=async(_q:any,r:any)=>ok(r,await s.list());
export const create=async(q:any,r:any)=>{const x=await s.create(q.body);await record(q.user.id,"CREATE","AdminUser",x._id.toString());return ok(r,x,"Admin created",201)};
export const update=async(q:any,r:any)=>{const x=await s.update(q.params.id,q.body);await record(q.user.id,"UPDATE","AdminUser",q.params.id);return ok(r,x)};
