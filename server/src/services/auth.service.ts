import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import {User,Affiliate,RefreshToken,EmailToken} from "../models";
import {env} from "../config/env";
import {sendEmail,verificationEmail,passwordResetEmail} from "./email.service";

const token=(u:any)=>jwt.sign({id:u._id.toString(),role:u.role,email:u.email},env.JWT_SECRET,{expiresIn:env.JWT_EXPIRES_IN as any});
const code=()=>`AFF-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
const hash=(v:string)=>crypto.createHash("sha256").update(v).digest("hex");
const publicUser=(u:any)=>{const x=u.toObject?u.toObject():{...u};delete x.passwordHash;delete x.resetToken;delete x.resetExpires;return x;};
const refreshExpiry=()=>{const x:any=jwt.decode(jwt.sign({},env.REFRESH_TOKEN_SECRET,{expiresIn:env.REFRESH_TOKEN_EXPIRES_IN as any}));return new Date(Number(x.exp)*1000)};
async function issueRefresh(u:any,meta:any={}){const raw=crypto.randomBytes(48).toString("base64url");await RefreshToken.create({user:u._id,tokenHash:hash(raw),expiresAt:refreshExpiry(),userAgent:meta.userAgent,ip:meta.ip});return raw;}
export async function register(input:any,meta:any={}){
 const email=String(input.email).trim().toLowerCase();const session=await mongoose.startSession();let u:any;let verificationToken="";
 try{await session.withTransaction(async()=>{if(await User.findOne({email}).session(session))throw Object.assign(new Error("Email already registered"),{status:409});let c=code();while(await Affiliate.findOne({code:c}).session(session))c=code();u=(await User.create([{name:String(input.name).trim(),email,phone:input.phone,passwordHash:await bcrypt.hash(String(input.password),12),affiliateCode:c}],{session}))[0];await Affiliate.create([{user:u._id,code:c,active:true}],{session});verificationToken=crypto.randomBytes(32).toString("base64url");await EmailToken.create([{user:u._id,tokenHash:hash(verificationToken),type:"VERIFY_EMAIL",expiresAt:new Date(Date.now()+24*60*60*1000)}],{session});});
 await sendEmail(verificationEmail(email,verificationToken,env.CLIENT_URL));
 return {user:publicUser(u),verificationRequired:true,verificationToken:env.NODE_ENV==="production"?undefined:verificationToken};
 }finally{await session.endSession();}
}
export async function login(input:any,meta:any={}){const u:any=await User.findOne({email:String(input.email).trim().toLowerCase()}).select("+passwordHash");if(!u||!u.active||!(await bcrypt.compare(String(input.password),u.passwordHash)))throw Object.assign(new Error("Invalid credentials"),{status:401});if(!u.emailVerified)throw Object.assign(new Error("Please verify your email before signing in"),{status:403});return {user:publicUser(u),token:token(u),refreshToken:undefined};}
export async function refresh(raw:string,meta:any={}){if(!raw)throw Object.assign(new Error("Invalid or expired refresh token"),{status:401});const rt:any=await RefreshToken.findOneAndUpdate({tokenHash:hash(raw),revokedAt:{$exists:false},expiresAt:{$gt:new Date()}},{$set:{revokedAt:new Date()}},{new:true});if(!rt)throw Object.assign(new Error("Invalid or expired refresh token"),{status:401});const u:any=await User.findById(rt.user);if(!u?.active)throw Object.assign(new Error("Account is disabled"),{status:401});const replacement=await issueRefresh(u,meta);rt.replacedByHash=hash(replacement);await rt.save();return {user:publicUser(u),token:token(u),refreshToken:replacement};}
export async function logout(raw:string){if(raw)await RefreshToken.updateOne({tokenHash:hash(raw),revokedAt:{$exists:false}},{$set:{revokedAt:new Date()}});return {message:"Logged out"};}
export async function me(id:string){return User.findById(id).select("-passwordHash -resetToken -resetExpires");}
export async function requestReset(email:string){const u:any=await User.findOne({email:String(email).trim().toLowerCase()});if(!u)return {message:"If the account exists, a reset instruction will be sent."};const raw=crypto.randomBytes(32).toString("base64url");await EmailToken.deleteMany({user:u._id,type:"PASSWORD_RESET"});await EmailToken.create({user:u._id,tokenHash:hash(raw),type:"PASSWORD_RESET",expiresAt:new Date(Date.now()+30*60*1000)});
 await sendEmail(passwordResetEmail(u.email,raw,env.CLIENT_URL));
 return {message:"If the account exists, a reset instruction will be sent.",token:env.NODE_ENV==="production"?undefined:raw};}
export async function resetPassword(t:string,password:string){const e:any=await EmailToken.findOne({tokenHash:hash(t),type:"PASSWORD_RESET",usedAt:{$exists:false},expiresAt:{$gt:new Date()}});if(!e)throw Object.assign(new Error("Invalid or expired reset token"),{status:400});const u:any=await User.findById(e.user).select("+passwordHash");if(!u)throw Object.assign(new Error("Invalid or expired reset token"),{status:400});u.passwordHash=await bcrypt.hash(password,12);await u.save();e.usedAt=new Date();await e.save();await RefreshToken.updateMany({user:u._id,revokedAt:{$exists:false}},{$set:{revokedAt:new Date()}});return {message:"Password reset successful"};}
export async function verifyEmail(t:string){const e:any=await EmailToken.findOne({tokenHash:hash(t),type:"VERIFY_EMAIL",usedAt:{$exists:false},expiresAt:{$gt:new Date()}});if(!e)throw Object.assign(new Error("Invalid or expired verification token"),{status:400});await User.findByIdAndUpdate(e.user,{emailVerified:true});e.usedAt=new Date();await e.save();return {message:"Email verified successfully"};}

