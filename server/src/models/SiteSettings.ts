import {Schema,model} from 'mongoose';
const schema=new Schema({storeName:{type:String,default:'NovaCart'},logo:String,currency:{type:String,default:'PKR'},shippingFee:{type:Number,default:250},freeShippingThreshold:{type:Number,default:5000},contact:Schema.Types.Mixed,social:Schema.Types.Mixed,defaultCommission:{type:Number,default:10},storeStatus:{type:String,default:'OPEN'},maintenanceMode:{type:Boolean,default:false},homepage:Schema.Types.Mixed},{timestamps:true});
export const SiteSettings=model('SiteSettings',schema);
