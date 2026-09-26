import{Schema,model}from"mongoose";
const schema=new Schema({owner:{type:Schema.Types.ObjectId,ref:"User",required:true,index:true},resourceId:{type:Schema.Types.ObjectId,index:true},kind:{type:String,enum:["PAYMENT_RECEIPT","DELIVERY_PROOF","DELIVERY_SIGNATURE","ADMIN_MEDIA"],required:true,index:true},filename:{type:String,required:true},mimeType:{type:String,required:true},size:{type:Number,required:true},data:{type:Schema.Types.Buffer,required:true,select:false}},{timestamps:true});
export const Upload=model("Upload",schema);
