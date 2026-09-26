import {z} from "zod";
const oid=z.string().regex(/^[a-f\d]{24}$/i,"Invalid id");
const empty=z.object({}).strict();
const variant=z.object({variantId:oid,sku:z.string().max(120).optional(),name:z.string().max(200).optional(),color:z.string().max(100).optional(),size:z.string().max(100).optional(),attributes:z.record(z.string().max(100)).optional()}).strict().partial();
export const registerSchema=z.object({body:z.object({name:z.string().trim().min(2).max(120),email:z.string().email(),phone:z.string().max(40).optional(),password:z.string().min(8).max(128)}),query:empty,params:empty});
export const loginSchema=z.object({body:z.object({email:z.string().email(),password:z.string().min(1)}),query:empty,params:empty});
export const cartSchema=z.object({body:z.object({items:z.array(z.object({product:oid,quantity:z.number().int().min(1).max(999),variant:variant.optional()}))}),query:empty,params:empty});
export const checkoutSchema=z.object({body:z.object({paymentMethod:oid,address:z.object({fullName:z.string().trim().min(2).max(120),phone:z.string().trim().min(5).max(40),address:z.string().trim().min(5).max(500),city:z.string().trim().min(2).max(100),province:z.string().trim().max(100).optional(),postalCode:z.string().trim().max(20).optional(),country:z.string().trim().max(100).default("Pakistan")}),couponCode:z.string().trim().max(80).optional()}),query:empty,params:empty});
export const paymentSchema=z.object({body:z.object({order:oid,method:oid,amount:z.number().positive(),transactionId:z.string().trim().min(3).max(120).optional(),paymentTime:z.coerce.date().optional(),receiptUrl:z.string().url().optional(),note:z.string().max(1000).optional()}),query:empty,params:empty});
export const statusSchema=z.object({body:z.object({status:z.string().min(1).max(60),reason:z.string().max(1000).optional(),note:z.string().max(1000).optional()}),query:empty,params:empty});
export const resetRequestSchema=z.object({body:z.object({email:z.string().email()}),query:empty,params:empty});export const resetSchema=z.object({body:z.object({token:z.string().min(20),password:z.string().min(8).max(128)}),query:empty,params:empty});export const verifySchema=z.object({body:z.object({token:z.string().min(20)}),query:empty,params:empty});
export const reviewSchema=z.object({body:z.object({status:z.enum(["APPROVED","REJECTED","PENDING"]),note:z.string().max(1000).optional()}),query:empty,params:empty});
export const commissionTransitionSchema=z.object({body:z.object({status:z.enum(["APPROVED","PAID","REVERSED"]),reason:z.string().max(1000).optional()}).strict(),query:empty,params:z.object({id:oid}).strict()});
export const orderStatusSchema=z.object({body:z.object({status:z.enum(["PROCESSING","PACKED","SHIPPED","IN_TRANSIT","DELIVERED","COMPLETED","CANCELLED"])}),query:empty,params:empty});
export const affiliateToggleSchema=z.object({body:z.object({active:z.boolean()}).strict(),query:empty,params:z.object({id:oid}).strict()});
export const checkoutPreviewSchema=z.object({body:empty,query:z.object({coupon:z.string().trim().max(80).optional()}),params:empty});

export const objectIdParamSchema = (key:string) => z.object({body:empty,query:empty,params:z.object({[key]:oid})});
export const emptyRequestSchema = z.object({body:empty,query:empty,params:empty});
export const deliveryUpdateSchema=z.object({body:z.object({status:z.enum(["PENDING","PACKED","SHIPPED","IN_TRANSIT","OUT_FOR_DELIVERY","DELIVERED","FAILED","RETURNED"]).optional(),courier:z.string().max(120).optional(),trackingNumber:z.string().max(120).optional(),eta:z.coerce.date().optional(),deliveryDate:z.coerce.date().optional(),recipientName:z.string().max(120).optional(),recipientConfirmedAt:z.coerce.date().optional(),notes:z.string().max(2000).optional(),proofFileId:oid.optional(),signatureFileId:oid.optional()}).strict(),query:empty,params:z.object({orderId:oid})});
export const recipientConfirmationSchema=z.object({body:z.object({recipientName:z.string().trim().min(2).max(120),signatureFileId:oid.optional(),notes:z.string().max(2000).optional()}).strict(),query:empty,params:z.object({orderId:oid}).strict()});
export const inventoryAdjustSchema=z.object({body:z.object({change:z.number().int().refine(v=>v!==0),type:z.enum(["MANUAL_ADJUSTMENT","DAMAGED","LOST","RETURN","RESTOCK","CORRECTION"]).default("MANUAL_ADJUSTMENT"),note:z.string().max(1000).optional(),variantId:oid.optional()}).strict(),query:empty,params:z.object({productId:oid})});
export const uploadSchema=z.object({body:z.object({kind:z.enum(["PAYMENT_RECEIPT","DELIVERY_PROOF","DELIVERY_SIGNATURE","ADMIN_MEDIA"]),filename:z.string().min(1).max(255),mimeType:z.enum(["image/jpeg","image/png","image/webp","application/pdf","video/mp4"]),data:z.string().min(20),orderId:oid.optional()}).strict(),query:empty,params:empty});
const productVariantMutationSchema=z.object({
  _id:oid.optional(),
  sku:z.string().trim().min(1).max(120),
  name:z.string().trim().min(1).max(200),
  attributes:z.record(z.string().max(100)).optional(),
  color:z.string().max(100).optional(),
  size:z.string().max(100).optional(),
  price:z.number().min(0),
  compareAtPrice:z.number().min(0).optional(),
  active:z.boolean().optional(),
  images:z.array(z.string().max(2000)).optional(),
  weight:z.number().min(0).optional(),
  commissionType:z.enum(["default","percentage","fixed"]).optional(),
  commissionValue:z.number().min(0).optional()
}).strict();

export const productMutationSchema=z.object({body:z.object({
  name:z.string().trim().min(1).max(200).optional(),slug:z.string().trim().min(1).max(220).optional(),sku:z.string().trim().min(1).max(120).optional(),brand:z.string().max(120).optional(),description:z.string().max(10000).optional(),shortDescription:z.string().max(1000).optional(),category:oid.optional(),
  originalPrice:z.number().min(0).optional(),salePrice:z.number().min(0).optional(),discount:z.number().min(0).optional(),discountType:z.enum(["percentage","fixed"]).optional(),discountValue:z.number().min(0).optional(),discountPercentage:z.number().min(0).max(100).optional(),fixedDiscountAmount:z.number().min(0).optional(),limitedTimeOffer:z.boolean().optional(),offerStartDate:z.coerce.date().optional(),offerEndDate:z.coerce.date().optional(),type:z.string().max(80).optional(),
  images:z.array(z.string().max(2000)).optional(),video:z.string().max(2000).optional(),colors:z.array(z.string().max(100)).optional(),sizes:z.array(z.string().max(100)).optional(),
  variants:z.array(productVariantMutationSchema).optional(),weight:z.number().min(0).optional(),availability:z.boolean().optional(),featured:z.boolean().optional(),newArrival:z.boolean().optional(),bestSeller:z.boolean().optional(),limitedStock:z.boolean().optional(),
  tags:z.array(z.string().max(100)).optional(),gender:z.string().max(50).optional(),seoTitle:z.string().max(200).optional(),seoDescription:z.string().max(1000).optional(),
  commissionType:z.enum(["default","percentage","fixed"]).optional(),commissionValue:z.number().min(0).optional(),commissionStart:z.coerce.date().optional(),commissionEnd:z.coerce.date().optional(),active:z.boolean().optional()
}).strict(),query:empty,params:z.object({id:oid}).strict()}).strict();

export const productCreateSchema=productMutationSchema.extend({params:empty});

export const notificationListSchema=z.object({body:empty,query:z.object({page:z.coerce.number().int().min(1).max(10000).optional(),limit:z.coerce.number().int().min(1).max(100).optional(),unread:z.coerce.boolean().optional()}).strict(),params:empty});
export const notificationCreateSchema=z.object({body:z.object({user:oid.optional(),audience:z.enum(["all"]).optional(),type:z.string().min(1).max(80),title:z.string().min(1).max(200),message:z.string().min(1).max(2000),channels:z.array(z.string().max(40)).optional(),data:z.record(z.unknown()).optional()}).strict(),query:empty,params:empty});
export const affiliateFilterSchema=z.object({body:empty,query:z.object({from:z.string().optional(),to:z.string().optional(),page:z.coerce.number().int().min(1).max(100000).optional(),limit:z.coerce.number().int().min(1).max(100).optional(),search:z.string().max(120).optional(),status:z.enum(["active","inactive"]).optional()}).strict(),params:empty});
export const productListSchema=z.object({body:empty,query:z.object({page:z.coerce.number().int().min(1).max(10000).optional(),limit:z.coerce.number().int().min(1).max(100).optional(),search:z.string().max(120).optional(),category:z.string().max(120).optional(),sort:z.enum(["price_asc","price_desc","popular","discount"]).optional(),featured:z.coerce.boolean().optional(),newArrival:z.coerce.boolean().optional(),bestSeller:z.coerce.boolean().optional(),limitedStock:z.coerce.boolean().optional(),gender:z.enum(["Male","Female","Unisex"]).optional(),brand:z.string().max(120).optional(),availability:z.coerce.boolean().optional(),minPrice:z.coerce.number().min(0).optional(),maxPrice:z.coerce.number().min(0).optional(),discounted:z.coerce.boolean().optional()}).strict(),params:empty});
export const adminUserCreateSchema=z.object({body:z.object({name:z.string().trim().min(2).max(120),email:z.string().email(),phone:z.string().max(40).optional(),password:z.string().min(12).max(128),role:z.enum(["admin","super_admin"])}).strict(),query:empty,params:empty});
export const adminUserUpdateSchema=z.object({body:z.object({name:z.string().trim().min(2).max(120).optional(),phone:z.string().max(40).optional(),role:z.enum(["admin","super_admin"]).optional(),active:z.boolean().optional()}).strict(),query:empty,params:z.object({id:oid}).strict()});
export const promoImageCreateSchema=z.object({body:z.object({title:z.string().trim().min(1).max(200),description:z.string().max(1000).optional(),image:z.string().max(2000),buttonText:z.string().max(100).optional(),buttonUrl:z.string().max(2000).optional(),active:z.boolean().optional(),sortOrder:z.number().int().min(0).max(100000).optional()}).strict(),query:empty,params:empty});
export const promoImageUpdateSchema=promoImageCreateSchema.extend({body:promoImageCreateSchema.shape.body.partial().strict(),params:z.object({id:oid}).strict()});

export const settingsSchema=z.object({body:z.object({storeName:z.string().min(1).max(120).optional(),logo:z.string().max(2000).optional(),currency:z.string().max(10).optional(),shippingFee:z.number().min(0).optional(),freeShippingThreshold:z.number().min(0).optional(),contact:z.record(z.string().max(500)).optional(),social:z.record(z.string().max(500)).optional(),defaultCommission:z.number().min(0).max(100).optional(),storeStatus:z.string().max(40).optional(),maintenanceMode:z.boolean().optional(),homepage:z.record(z.unknown()).optional()}).strict(),query:empty,params:empty});
export const auditFilterSchema=z.object({body:empty,query:z.object({page:z.coerce.number().int().min(1).max(10000).optional(),limit:z.coerce.number().int().min(1).max(100).optional(),actor:oid.optional(),action:z.string().max(100).optional(),entity:z.string().max(100).optional(),entityId:z.string().max(120).optional(),from:z.coerce.date().optional(),to:z.coerce.date().optional()}).strict(),params:empty});
export const idParam=(key:string)=>z.object({body:empty,query:empty,params:z.object({[key]:oid}).strict()});

export const categoryCreateSchema=z.object({body:z.object({name:z.string().trim().min(1).max(120),slug:z.string().trim().min(1).max(160).optional(),description:z.string().max(2000).optional(),image:z.string().max(2000).optional(),parent:oid.optional(),active:z.boolean().optional(),sortOrder:z.number().int().min(0).max(100000).optional(),seoTitle:z.string().max(200).optional(),seoDescription:z.string().max(1000).optional()}).strict(),query:empty,params:empty});
export const categoryUpdateSchema=z.object({body:categoryCreateSchema.shape.body.partial().strict(),query:empty,params:z.object({id:oid}).strict()});

export const couponCreateSchema=z.object({body:z.object({code:z.string().trim().min(1).max(80),type:z.enum(["percentage","fixed"]),value:z.number().min(0),minOrder:z.number().min(0).optional(),maxDiscount:z.number().min(0).optional(),startsAt:z.coerce.date().optional(),expiresAt:z.coerce.date().optional(),usageLimit:z.number().int().min(1).optional(),perUserLimit:z.number().int().min(1).optional(),products:z.array(oid).optional(),categories:z.array(oid).optional(),active:z.boolean().optional()}).strict(),query:empty,params:empty});
export const couponUpdateSchema=z.object({body:couponCreateSchema.shape.body.partial().strict(),query:empty,params:z.object({id:oid}).strict()});
export const couponValidateSchema=z.object({body:z.object({code:z.string().trim().min(1).max(80),subtotal:z.number().min(0)}).strict(),query:empty,params:empty});

export const bannerCreateSchema=z.object({body:z.object({title:z.string().trim().min(1).max(200),subtitle:z.string().max(1000).optional(),image:z.string().max(2000).optional(),buttonText:z.string().max(100).optional(),buttonUrl:z.string().max(2000).optional(),active:z.boolean().optional(),sortOrder:z.number().int().min(0).max(100000).optional(),startDate:z.coerce.date().optional(),endDate:z.coerce.date().optional()}).strict(),query:empty,params:empty});
export const bannerUpdateSchema=bannerCreateSchema.extend({body:bannerCreateSchema.shape.body.partial().strict(),params:z.object({id:oid}).strict()});

export const paymentMethodCreateSchema=z.object({body:z.object({name:z.string().trim().min(1).max(120),type:z.string().trim().min(1).max(40).optional(),instructions:z.string().max(3000).optional(),accountNumber:z.string().max(200).optional(),accountTitle:z.string().max(200).optional(),requiresTransactionId:z.boolean().optional(),requiresReceipt:z.boolean().optional(),requiresManualReview:z.boolean().optional(),active:z.boolean().optional(),ordering:z.number().int().min(0).max(100000).optional()}).strict(),query:empty,params:empty});
export const paymentMethodUpdateSchema=paymentMethodCreateSchema.extend({body:paymentMethodCreateSchema.shape.body.partial().strict(),params:z.object({id:oid}).strict()});

export const videoCreateSchema=z.object({body:z.object({url:z.string().url().max(2000),thumbnail:z.string().max(2000).optional(),title:z.string().max(200).optional(),description:z.string().max(2000).optional(),active:z.boolean().optional(),sortOrder:z.number().int().min(0).max(100000).optional()}).strict(),query:empty,params:empty});
export const videoUpdateSchema=videoCreateSchema.extend({body:videoCreateSchema.shape.body.partial().strict(),params:z.object({id:oid}).strict()});

export const profileUpdateSchema=z.object({body:z.object({name:z.string().trim().min(2).max(120).optional(),phone:z.string().max(40).optional(),profilePicture:z.string().max(2000).optional()}).strict(),query:empty,params:empty});
export const addressCreateSchema=z.object({body:z.object({label:z.string().max(80).optional(),fullName:z.string().trim().min(2).max(120),phone:z.string().trim().min(5).max(40),address:z.string().trim().min(5).max(500),city:z.string().trim().min(2).max(100),area:z.string().max(100).optional(),province:z.string().max(100).optional(),postalCode:z.string().max(20).optional(),country:z.string().max(100).optional(),isDefault:z.boolean().optional()}).strict(),query:empty,params:empty});
export const addressIdSchema=idParam("id");

export const reviewCreateSchema=z.object({body:z.object({rating:z.number().int().min(1).max(5),title:z.string().max(200).optional(),body:z.string().max(3000).optional()}).strict(),query:empty,params:z.object({productId:oid}).strict()});

export const paymentIdSchema=idParam("id");
export const orderIdSchema=idParam("id");
export const notificationIdSchema=idParam("id");

export const reviewModerateSchema=z.object({body:reviewSchema.shape.body,query:empty,params:z.object({id:oid}).strict()});

export const paymentReviewSchema=z.object({body:reviewSchema.shape.body,query:empty,params:z.object({id:oid}).strict()});

