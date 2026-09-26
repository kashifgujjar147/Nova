import {Schema,model} from 'mongoose';
const schema=new Schema({url:{type:String,required:true},thumbnail:String,title:String,description:String,active:{type:Boolean,default:true},sortOrder:{type:Number,default:0}},{timestamps:true});
export const PromoVideo=model('PromoVideo',schema);
