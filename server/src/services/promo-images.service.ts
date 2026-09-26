import {PromoImage} from "../models";
export const list=()=>PromoImage.find({active:true}).sort({sortOrder:1,createdAt:1});
export const all=()=>PromoImage.find().sort({sortOrder:1,createdAt:1});
export const create=(d:any)=>PromoImage.create(d);
export const update=(id:string,d:any)=>PromoImage.findByIdAndUpdate(id,d,{new:true,runValidators:true});
export const remove=(id:string)=>PromoImage.findByIdAndUpdate(id,{active:false},{new:true});
