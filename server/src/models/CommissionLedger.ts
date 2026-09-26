import {Schema,model} from "mongoose";
const schema=new Schema({affiliate:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},commission:{type:Schema.Types.ObjectId,ref:"Commission",required:true,index:true},order:{type:Schema.Types.ObjectId,ref:"Order",index:true},type:{type:String,enum:["COMMISSION_CREATED","COMMISSION_APPROVED","COMMISSION_PAID","COMMISSION_REVERSED","COMMISSION_ADJUSTED"],required:true},amount:{type:Number,required:true},balanceDelta:{type:Number,required:true},reason:String,actor:{type:Schema.Types.ObjectId,ref:"User"},metadata:Schema.Types.Mixed},{timestamps:true});
schema.index({commission:1,createdAt:1});
export const CommissionLedger=model("CommissionLedger",schema);
