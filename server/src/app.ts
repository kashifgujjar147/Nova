import express from "express"; import helmet from "helmet"; import cors from "cors"; import rateLimit from "express-rate-limit";
import {env,allowedOrigins} from "./config/env"; import {errorHandler} from "./middleware/error";
import auth from "./routes/auth.routes"; import users from "./routes/users.routes"; import products from "./routes/products.routes"; import categories from "./routes/categories.routes"; import cart from "./routes/cart.routes"; import checkout from "./routes/checkout.routes"; import orders from "./routes/orders.routes"; import payments from "./routes/payments.routes"; import paymentMethods from "./routes/payment-methods.routes"; import affiliates from "./routes/affiliates.routes"; import commissions from "./routes/commissions.routes"; import inventory from "./routes/inventory.routes"; import banners from "./routes/banners.routes"; import videos from "./routes/videos.routes"; import coupons from "./routes/coupons.routes"; import notifications from "./routes/notifications.routes"; import reviews from "./routes/reviews.routes"; import delivery from "./routes/delivery.routes"; import settings from "./routes/settings.routes"; import admin from "./routes/admin.routes"; import audit from "./routes/audit.routes"; import adminUsers from "./routes/admin-users.routes"; import uploads from "./routes/uploads.routes"; import promoImages from "./routes/promo-images.routes";
export const app=express();
app.disable("x-powered-by"); app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const origins=allowedOrigins.length?allowedOrigins:[env.CLIENT_URL];
app.use(cors({origin:(origin:any,cb:any)=>!origin||origins.includes(origin)?cb(null,true):cb(new Error("CORS origin denied")),credentials:true}));
app.use(express.json({limit:"6mb"}));
app.use((req:any,_res:any,next:any)=>{const raw=String(req.headers.cookie||"");req.cookies={};for(const part of raw.split(";")){const i=part.indexOf("=");if(i>0)req.cookies[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim())}next();});
app.get("/api/health",(_q:any,r:any)=>r.json({success:true,data:{status:"ok",service:"novacart-api"}}));
const general=rateLimit({windowMs:env.RATE_LIMIT_WINDOW_MS,max:env.RATE_LIMIT_MAX,standardHeaders:true,legacyHeaders:false});
const authLimit=rateLimit({windowMs:15*60*1000,max:env.AUTH_RATE_LIMIT_MAX,standardHeaders:true,legacyHeaders:false});
app.use("/api/auth",authLimit,auth); app.use("/api",general);
const routes:any={users,products,categories,cart,checkout,orders,payments,"payment-methods":paymentMethods,affiliates,commissions,inventory,banners,videos,coupons,notifications,reviews,delivery,settings,admin,audit, "admin-users":adminUsers,uploads,"promo-images":promoImages};
Object.entries(routes).forEach(([n,r])=>app.use("/api/"+n,r as any)); app.use(errorHandler);

