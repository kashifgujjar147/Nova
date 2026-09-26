import {Schema,model} from "mongoose";
const schema=new Schema({
  title:{type:String,required:true,trim:true,maxlength:200},
  description:{type:String,maxlength:1000},
  image:{type:String,required:true},
  buttonText:{type:String,maxlength:100},
  buttonUrl:{type:String,maxlength:2000},
  active:{type:Boolean,default:true},
  sortOrder:{type:Number,default:0,index:true}
},{timestamps:true});
export const PromoImage=model("PromoImage",schema);
