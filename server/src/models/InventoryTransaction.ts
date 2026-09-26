import {Schema,model} from 'mongoose';
const reasons=['INITIAL_STOCK','SALE','ORDER_CANCELLATION','CUSTOMER_REFUND','RETURN','MANUAL_ADJUSTMENT','DAMAGED','LOST','RESTOCK','CORRECTION'] as const;
const schema=new Schema({product:{type:Schema.Types.ObjectId,ref:'Product',required:true,index:true},variantId:{type:Schema.Types.ObjectId,index:true},sku:String,change:{type:Number,required:true},balanceAfter:{type:Number,required:true},type:{type:String,enum:reasons,required:true,index:true},referenceType:{type:String,index:true},referenceId:{type:Schema.Types.ObjectId,index:true},orderId:{type:Schema.Types.ObjectId,ref:'Order',index:true},actor:{type:Schema.Types.ObjectId,ref:'User'},note:String},{timestamps:true});
schema.index({referenceType:1,referenceId:1,type:1,product:1,variantId:1},{unique:true,sparse:true});
export const InventoryTransaction=model('InventoryTransaction',schema);
export const INVENTORY_REASONS=reasons;
