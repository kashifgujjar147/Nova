import {Product,Category} from "../models";import {roundMoney} from "../utils/money";import {getAvailableStock} from "../utils/stock";
const fail=(m:string,s=400)=>Object.assign(new Error(m),{status:s});
function normalizeVariants(variants:any[]|undefined, existing:any[]=[]){
 if(!variants)return undefined; const seen=new Set<string>(); const existingById=new Map(existing.map((v:any)=>[String(v._id),v]));
 return variants.map((v:any)=>{const sku=String(v.sku||"").trim().toUpperCase();if(!sku)throw fail("Variant SKU is required");if(seen.has(sku))throw fail(`Duplicate variant SKU: ${sku}`);seen.add(sku);const attrs=v.attributes&&typeof v.attributes==="object"&&!Array.isArray(v.attributes)?Object.fromEntries(Object.entries(v.attributes).map(([k,val])=>[String(k),String(val)])):{};const old=v._id?existingById.get(String(v._id)):undefined;return {_id:v._id,sku,name:String(v.name||sku).trim(),attributes:attrs,color:v.color==null?undefined:String(v.color),size:v.size==null?undefined:String(v.size),price:roundMoney(Number(v.price)),compareAtPrice:v.compareAtPrice==null?undefined:roundMoney(Number(v.compareAtPrice)),stock:old?Number(old.stock||0):0,active:v.active!==false,images:Array.isArray(v.images)?v.images.filter((x:any)=>typeof x==="string"&&x.length<=2000):[],weight:v.weight==null?undefined:Number(v.weight),commissionType:v.commissionType||"default",commissionValue:v.commissionValue==null?undefined:Number(v.commissionValue)};});
}
function normalizeDiscount(payload:any){
  const p={...payload};
  const type=p.discountType;
  const value=Number(p.discountValue ?? (type==="percentage" ? p.discountPercentage : type==="fixed" ? p.fixedDiscountAmount : 0));
  if(type==="percentage"){
    if(value<0 || value>100) throw fail("Percentage discount must be between 0 and 100");
    p.discountValue=value;
    p.discountPercentage=value;
    p.fixedDiscountAmount=undefined;
    p.discount=value;
  }else if(type==="fixed"){
    if(value<0) throw fail("Fixed discount cannot be negative");
    p.discountValue=value;
    p.fixedDiscountAmount=value;
    p.discountPercentage=undefined;
    p.discount=value;
  }
  if(p.offerStartDate && p.offerEndDate && new Date(p.offerEndDate)<new Date(p.offerStartDate)) throw fail("Offer end date must be after offer start date");
  if(p.limitedTimeOffer===false){ p.offerStartDate=undefined; p.offerEndDate=undefined; }
  return p;
}
export function calculateDiscountedPrice(originalPrice:number, type?:string, value?:number){
  const original=Number(originalPrice||0), discount=Number(value||0);
  if(type==="percentage") return roundMoney(original*(1-discount/100));
  if(type==="fixed") return roundMoney(Math.max(0,original-discount));
  return roundMoney(original);
}
export function effectivePrice(p:any,v?:any,now=new Date()){
  const base=Number(v?.price??p.salePrice??p.originalPrice??0);
  if(v) return roundMoney(base);
  const type=p.discountType;
  const value=Number(p.discountValue ?? (type==="percentage" ? p.discountPercentage : type==="fixed" ? p.fixedDiscountAmount : 0));
  if(type && value>0){
    if(p.limitedTimeOffer){
      const active=(!p.offerStartDate||new Date(p.offerStartDate)<=now)&&(!p.offerEndDate||new Date(p.offerEndDate)>=now);
      return active ? calculateDiscountedPrice(Number(p.originalPrice),type,value) : roundMoney(Number(p.originalPrice||base));
    }
    return calculateDiscountedPrice(Number(p.originalPrice),type,value);
  }
  return roundMoney(base);
}
export async function list(q:any){const page=Math.max(1,Number(q.page||1)),limit=Math.min(100,Math.max(1,Number(q.limit||20)));const f:any={active:true};if(q.search){const safe=String(q.search).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");f.$or=[{name:new RegExp(safe,"i")},{sku:new RegExp(safe,"i")},{brand:new RegExp(safe,"i")}];}if(q.featured!==undefined)f.featured=String(q.featured)==="true";if(q.newArrival!==undefined)f.newArrival=String(q.newArrival)==="true";if(q.bestSeller!==undefined)f.bestSeller=String(q.bestSeller)==="true";if(q.limitedStock!==undefined)f.limitedStock=String(q.limitedStock)==="true";if(q.gender)f.gender=q.gender;if(q.brand)f.brand=new RegExp(String(q.brand).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");if(q.availability!==undefined)f.availability=String(q.availability)==="true";if(q.discounted==="true"){const discountOr={$or:[{discount:{$gt:0}},{limitedTimeOffer:true}]};if(f.$or){f.$and=[{$or:f.$or},discountOr];delete f.$or;}else Object.assign(f,discountOr);}if(q.minPrice!=null||q.maxPrice!=null){f.salePrice={};if(q.minPrice!=null)f.salePrice.$gte=Number(q.minPrice);if(q.maxPrice!=null)f.salePrice.$lte=Number(q.maxPrice);}if(q.category){const c:any=await Category.findOne({$or:[{_id:/^[a-f\d]{24}$/i.test(q.category)?q.category:null},{slug:String(q.category)}],active:true});if(!c)return{items:[],total:0,page,limit,pages:0};f.category=c._id;}const sort:any=q.sort==="price_asc"?{salePrice:1}:q.sort==="price_desc"?{salePrice:-1}:q.sort==="popular"?{bestSeller:-1}:q.sort==="discount"?{discount:-1}:{createdAt:-1};const total=await Product.countDocuments(f);const items=await Product.find(f).populate("category").sort(sort).skip((page-1)*limit).limit(limit);return{items:items.map((item:any)=>{const x=item.toObject();const price=effectivePrice(x);return {...x,salePrice:price,discount:Math.max(0,Number(x.originalPrice||price)-price),availableStock:getAvailableStock(x)};}),total,page,limit,pages:Math.ceil(total/limit)};}
export async function getBySlug(slug:string){const item:any=await Product.findOne({slug,active:true}).populate("category");if(!item)return null;const x=item.toObject();const price=effectivePrice(x);return {...x,salePrice:price,discount:Math.max(0,Number(x.originalPrice||price)-price),availableStock:getAvailableStock(x)};}
function makeSlug(value:string){
 const base=String(value||"product")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g,"-")
  .replace(/^-+|-+$/g,"")
  .slice(0,180);
 return base || "product";
}

async function uniqueSlug(value:string){
 const base=makeSlug(value);
 let slug=base;
 let i=2;
 while(await Product.exists({slug})){
   slug=`${base}-${i++}`;
 }
 return slug;
}

async function uniqueSku(){
 let sku="";
 do{
   sku=`NC-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
 }while(await Product.exists({sku}));
 return sku;
}

export async function create(data:any){
 if(Object.prototype.hasOwnProperty.call(data,"stock")||data.variants?.some((v:any)=>Object.prototype.hasOwnProperty.call(v,"stock")))throw fail("Inventory must be changed through the inventory workflow");
 const variants=normalizeVariants(data.variants);
 const payload=normalizeDiscount({...data});
 delete payload.stock;

 if(variants)payload.variants=variants;

 payload.slug=await uniqueSlug(data.slug||data.name);
 payload.sku=String(data.sku||"").trim().toUpperCase()||await uniqueSku();

 if(!data.category)delete payload.category;

 const originalPrice=roundMoney(Number(data.originalPrice));
const effectiveSalePrice=data.discountType ? calculateDiscountedPrice(originalPrice,data.discountType,Number(data.discountValue ?? (data.discountType==="percentage"?data.discountPercentage:data.fixedDiscountAmount))) : roundMoney(Number(data.salePrice));
return Product.create({...payload,salePrice:effectiveSalePrice,originalPrice});}
export async function update(id:string,data:any){if(Object.prototype.hasOwnProperty.call(data,"stock")||data.variants?.some((v:any)=>Object.prototype.hasOwnProperty.call(v,"stock")))throw fail("Inventory must be changed through the inventory workflow");const existing:any=await Product.findById(id);if(!existing)throw fail("Product not found",404);const variants=normalizeVariants(data.variants,existing.variants||[]);if(variants){const retained=new Set(variants.filter((v:any)=>v._id).map((v:any)=>String(v._id)));const removed=(existing.variants||[]).filter((v:any)=>!retained.has(String(v._id))&&Number(v.stock||0)>0);if(removed.length)throw fail("Variants with stock cannot be removed; reduce their stock to zero first",409);}const payload=normalizeDiscount({...data});delete payload.stock;delete payload.variants;if(variants)payload.variants=variants;payload.originalPrice=data.originalPrice!=null?roundMoney(Number(data.originalPrice)):existing.originalPrice;
if(data.discountType){ payload.salePrice=calculateDiscountedPrice(payload.originalPrice,data.discountType,Number(data.discountValue ?? (data.discountType==="percentage"?data.discountPercentage:data.fixedDiscountAmount))); } else { payload.salePrice=data.salePrice!=null?roundMoney(Number(data.salePrice)):existing.salePrice; }
return Product.findByIdAndUpdate(id,payload,{new:true,runValidators:true});}
export const remove=(id:string)=>Product.findByIdAndUpdate(id,{active:false},{new:true});

