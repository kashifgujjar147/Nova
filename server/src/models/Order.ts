import { Schema, model } from "mongoose";
const orderItemSchema = new Schema({
  product:{type:Schema.Types.ObjectId,ref:'Product',required:true},
  variantId:{type:Schema.Types.ObjectId}, sku:{type:String,required:true}, productName:{type:String,required:true}, variantName:String,
  variantAttributes:{type:Map,of:String}, quantity:{type:Number,required:true,min:1}, unitPrice:{type:Number,required:true,min:0}, discount:{type:Number,default:0,min:0}, subtotal:{type:Number,required:true,min:0},
  image:String,
  commission:{type:{type:String,enum:['percentage','fixed']},rate:Number,fixedCommissionAmount:Number,calculatedAmount:{type:Number,default:0,min:0}}
},{_id:true});
const statusHistorySchema=new Schema({status:String,at:{type:Date,default:Date.now},actor:{type:Schema.Types.ObjectId,ref:'User'}},{_id:false});
const addressSchema=new Schema({fullName:String,phone:String,address:String,city:String,province:String,postalCode:String,country:String},{_id:false});
const schema = new Schema({
  orderNumber:{type:String,required:true,unique:true,index:true},
  idempotencyKey:{type:String,trim:true},idempotencyFingerprint:{type:String,trim:true},user:{type:Schema.Types.ObjectId,ref:'User',index:true},
  guestTokenHash:{type:String,index:true,sparse:true},
  guestReference:{type:String,index:true,sparse:true},
  items:{type:[orderItemSchema],required:true},subtotal:{type:Number,required:true,min:0},discount:{type:Number,default:0,min:0},shipping:{type:Number,default:0,min:0},total:{type:Number,required:true,min:0},
  paymentMethod:{type:Schema.Types.ObjectId,ref:'PaymentMethod',required:true},paymentStatus:{type:String,enum:['PENDING','UNDER_REVIEW','APPROVED','REJECTED','REFUNDED'],default:'PENDING'},
  status:{type:String,enum:['PENDING','PAYMENT_REVIEW','PAYMENT_APPROVED','PROCESSING','PACKED','SHIPPED','IN_TRANSIT','DELIVERED','COMPLETED','CANCELLED','REFUNDED'],default:'PENDING',index:true},
  addressSnapshot:{type:addressSchema,required:true},couponCode:String,coupon:{type:Schema.Types.ObjectId,ref:'Coupon'},affiliateCode:String,affiliateUser:{type:Schema.Types.ObjectId,ref:'User'},affiliateClick:{type:Schema.Types.ObjectId,ref:'AffiliateClick'},
  statusHistory:{type:[statusHistorySchema],default:[]},notes:String,cancelledAt:Date,refundedAt:Date
},{timestamps:true});
schema.index({user:1,idempotencyKey:1},{unique:true,sparse:true});
schema.index({guestTokenHash:1,idempotencyKey:1},{unique:true,sparse:true});
schema.index({status:1,createdAt:-1});
export const Order = model('Order',schema);

