import {Schema,model} from 'mongoose';
const schema=new Schema({name:{type:String,required:true},slug:{type:String,required:true,unique:true,index:true},description:String,image:String,parent:{type:Schema.Types.ObjectId,ref:'Category'},active:{type:Boolean,default:true},sortOrder:{type:Number,default:0},seoTitle:String,seoDescription:String},{timestamps:true});
export const Category=model('Category',schema);
