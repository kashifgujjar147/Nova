import {Schema,model} from "mongoose";

const schema=new Schema({
  affiliate:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},
  amount:{type:Number,required:true,min:0.01},
  method:{type:String,enum:["EASYPAISA","JAZZCASH","BANK_TRANSFER"],required:true},
  accountTitle:{type:String,required:true,trim:true,maxlength:120},
  accountNumber:{type:String,required:true,trim:true,maxlength:120},
  bankName:{type:String,trim:true,maxlength:120},
  note:{type:String,trim:true,maxlength:1000},
  status:{type:String,enum:["PENDING","APPROVED","REJECTED","PAID"],default:"PENDING",index:true},
  adminNote:{type:String,trim:true,maxlength:1000},
  paymentReference:{type:String,trim:true,maxlength:200},
  requestedAt:{type:Date,default:Date.now},
  reviewedAt:Date,
  paidAt:Date,
  reviewedBy:{type:Schema.Types.ObjectId,ref:"User"},
  paidBy:{type:Schema.Types.ObjectId,ref:"User"}
},{timestamps:true});

schema.index({affiliate:1,createdAt:-1});
schema.index({status:1,createdAt:-1});

export const Withdrawal=model("Withdrawal",schema);
