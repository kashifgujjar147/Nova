import {Schema,model} from "mongoose";
const schema=new Schema({user:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},label:String,fullName:{type:String,required:true},phone:{type:String,required:true},address:{type:String,required:true},city:{type:String,required:true},area:String,province:String,postalCode:String,country:{type:String,default:"Pakistan"},isDefault:{type:Boolean,default:false}},{timestamps:true});
schema.index({user:1,isDefault:1});
export const Address=model("Address",schema);
