import * as s from "../services/products.service";import {ok} from "../utils/response";import {Product} from "../models";import {record} from "../services/audit.service";
export const list=async(q:any,r:any)=>ok(r,await s.list(q.query));export const get=async(q:any,r:any)=>{const x=await s.getBySlug(q.params.slug);if(!x)return r.status(404).json({success:false,message:"Product not found"});ok(r,x)};
export const create=async(q:any,r:any)=>{const x=await s.create(q.body);await record(q.user.id,"CREATE","Product",x._id.toString());return ok(r,x,"Product created",201)};
export const update=async(q:any,r:any)=>{const x=await s.update(q.params.id,q.body);await record(q.user.id,"UPDATE","Product",q.params.id);return ok(r,x)};
export const remove=async(q:any,r:any)=>{const x=await s.remove(q.params.id);await record(q.user.id,"DEACTIVATE","Product",q.params.id);return ok(r,x)};
export const adminAll=async(q:any,r:any)=>ok(r,await Product.find().populate("category").sort({createdAt:-1}).limit(200));
