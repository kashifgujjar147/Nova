import {Schema,model} from "mongoose";
const schema=new Schema({user:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},tokenHash:{type:String,required:true,unique:true,index:true},expiresAt:{type:Date,required:true,index:true},revokedAt:Date,replacedByHash:String,userAgent:String,ip:String},{timestamps:true});
schema.index({expiresAt:1},{expireAfterSeconds:0});
export const RefreshToken=model("RefreshToken",schema);
