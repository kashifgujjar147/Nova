import * as s from "../services/settings.service";import{ok}from"../utils/response";import{record}from"../services/audit.service";
export const get=async(_q:any,r:any)=>ok(r,await s.get());
export const update=async(q:any,r:any)=>{const x=await s.update(q.body);await record(q.user.id,"UPDATE","SiteSettings",x?._id?.toString(),{keys:Object.keys(q.body||{})});return ok(r,x)};
