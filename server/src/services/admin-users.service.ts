import bcrypt from "bcryptjs";import{User}from "../models";
export const list=()=>User.find({role:{$in:["admin","super_admin"]}}).select("-passwordHash -resetToken -resetExpires").sort({createdAt:-1});
export async function create(d:any){if(!["admin","super_admin"].includes(d.role))throw Object.assign(new Error("Invalid admin role"),{status:400});return User.create({name:d.name,email:d.email.toLowerCase(),phone:d.phone,passwordHash:await bcrypt.hash(d.password,12),role:d.role,active:true});}
export const update=(id:string,d:any)=>User.findByIdAndUpdate(id,{...(d.role?{role:d.role}:{}),...(typeof d.active==="boolean"?{active:d.active}:{}),...(d.name?{name:d.name}:{}),...(d.phone?{phone:d.phone}:{})},{new:true,runValidators:true}).select("-passwordHash -resetToken -resetExpires");
