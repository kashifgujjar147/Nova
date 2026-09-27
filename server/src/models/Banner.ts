import {Schema,model} from 'mongoose';
const schema=new Schema({title:{type:String,trim:true},subtitle:String,image:String,buttonText:String,buttonUrl:String,active:{type:Boolean,default:true},sortOrder:{type:Number,default:0},startDate:Date,endDate:Date},{timestamps:true});
export const Banner=model('Banner',schema);

