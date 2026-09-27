import { Schema, model } from "mongoose";

const cartItemSchema = new Schema({
  product:{type:Schema.Types.ObjectId,ref:"Product",required:true},
  quantity:{type:Number,required:true,min:1,max:999},
  variant:{
    variantId:{type:Schema.Types.ObjectId},
    sku:{type:String,trim:true},
    name:{type:String,trim:true},
    attributes:{type:Map,of:String},
    color:String,
    size:String
  }
},{_id:false});

const schema=new Schema({
  user:{type:Schema.Types.ObjectId,ref:"User",unique:true,sparse:true},
  guestTokenHash:{type:String,index:true,unique:true,sparse:true},
  items:{type:[cartItemSchema],default:[]},
  affiliateCode:String,
  affiliateUser:{type:Schema.Types.ObjectId,ref:"User"}
},{timestamps:true});

export const Cart=model("Cart",schema);
