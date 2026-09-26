import {Schema,model} from "mongoose";
const schema=new Schema({user:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},tokenHash:{type:String,required:true,unique:true,index:true},type:{type:String,enum:["VERIFY_EMAIL","PASSWORD_RESET"],required:true},expiresAt:{type:Date,required:true,index:true},usedAt:Date},{timestamps:true});
schema.index({expiresAt:1},{expireAfterSeconds:0});
export const EmailToken=model("EmailToken",schema);
