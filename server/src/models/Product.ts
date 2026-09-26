import { Schema, model } from "mongoose";

const variantSchema = new Schema({
  sku: { type: String, required: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  attributes: { type: Map, of: String, default: {} },
  color: { type: String, trim: true },
  size: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  images: { type: [String], default: [] },
  weight: { type: Number, min: 0 },
  commissionType: { type: String, enum: ['default','percentage','fixed'], default: 'default' },
  commissionValue: { type: Number, min: 0 },
}, { _id: true, strict: true });

const schema = new Schema({
  name:{type:String,required:true,trim:true}, slug:{type:String,required:true,unique:true,index:true},
  sku:{type:String,required:true,unique:true,index:true,trim:true,uppercase:true}, brand:String,description:String,shortDescription:String,
  category:{type:Schema.Types.ObjectId,ref:'Category',index:true},
  originalPrice:{type:Number,required:true,min:0},
  salePrice:{type:Number,required:true,min:0},
  discount:{type:Number,min:0},
  discountType:{type:String,enum:['percentage','fixed']},
  discountValue:{type:Number,min:0},
  discountPercentage:{type:Number,min:0,max:100},
  fixedDiscountAmount:{type:Number,min:0},
  limitedTimeOffer:{type:Boolean,default:false},
  offerStartDate:{type:Date},
  offerEndDate:{type:Date},
  type:String,stock:{type:Number,default:0,min:0},images:{type:[String],default:[]},video:String,videoThumbnail:String,
  colors:{type:[String],default:[]},sizes:{type:[String],default:[]},variants:{type:[variantSchema],default:[]},weight:{type:Number,min:0},
  availability:{type:Boolean,default:true},featured:Boolean,newArrival:Boolean,bestSeller:Boolean,limitedStock:Boolean,
  tags:[String],gender:String,seoTitle:String,seoDescription:String,
  commissionType:{type:String,enum:['default','percentage','fixed'],default:'default'},commissionValue:{type:Number,min:0},commissionStart:Date,commissionEnd:Date,
  active:{type:Boolean,default:true}
},{timestamps:true,strict:true});
schema.index({"variants.sku":1},{unique:true,sparse:true});
export const Product=model('Product',schema);

