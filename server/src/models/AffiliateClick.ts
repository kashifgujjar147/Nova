import {Schema,model} from 'mongoose';
const schema=new Schema({affiliate:{type:Schema.Types.ObjectId,ref:'User',required:true,index:true},code:{type:String,index:true},product:{type:Schema.Types.ObjectId,ref:'Product'},sessionId:String,ipHash:String,visitorHash:String,userAgent:String,converted:Boolean,createdAt:{type:Date,default:Date.now,index:true}},{timestamps:true});
schema.index({affiliate:1,visitorHash:1,createdAt:-1});
schema.index({affiliate:1,createdAt:-1});
export const AffiliateClick=model('AffiliateClick',schema);
