import {Schema,model} from 'mongoose';
const schema=new Schema({affiliate:{type:Schema.Types.ObjectId,ref:'User',required:true,index:true},order:{type:Schema.Types.ObjectId,ref:'Order',required:true,unique:true},click:{type:Schema.Types.ObjectId,ref:'AffiliateClick'},grossSales:{type:Number,default:0},validSales:{type:Number,default:0},reversedSales:{type:Number,default:0},commission:{type:Schema.Types.ObjectId,ref:'Commission'},status:{type:String,enum:['PENDING','APPROVED','REVERSED'],default:'PENDING',index:true},eligibleAt:Date},{timestamps:true});
schema.index({affiliate:1,createdAt:-1});
export const AffiliateConversion=model('AffiliateConversion',schema);
