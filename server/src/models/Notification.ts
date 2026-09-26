import {Schema,model} from 'mongoose';
const schema=new Schema({user:{type:Schema.Types.ObjectId,ref:'User',required:true,index:true},type:String,title:String,message:String,read:{type:Boolean,default:false},channels:[String],data:Schema.Types.Mixed},{timestamps:true});
schema.index({user:1,createdAt:-1});
export const Notification=model('Notification',schema);
