import {User,Address} from "../models";
export const update=async(id:string,d:any)=>User.findByIdAndUpdate(id,{name:d.name,phone:d.phone,profilePicture:d.profilePicture},{new:true,runValidators:true}).select("-passwordHash");
export const addresses=(id:string)=>Address.find({user:id}).sort({isDefault:-1,createdAt:-1});
export async function addAddress(user:string,d:any){const count=await Address.countDocuments({user});const makeDefault=Boolean(d.isDefault)||count===0;if(makeDefault)await Address.updateMany({user},{$set:{isDefault:false}});return Address.create({...d,user,isDefault:makeDefault});}
export const removeAddress=(id:string,user:string)=>Address.findOneAndDelete({_id:id,user});
export async function setDefault(id:string,user:string){const a:any=await Address.findOne({_id:id,user});if(!a)throw Object.assign(new Error("Address not found"),{status:404});await Address.updateMany({user},{$set:{isDefault:false}});a.isDefault=true;return a.save();}
