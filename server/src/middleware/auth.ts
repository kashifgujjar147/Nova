import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { User } from "../models";
export interface AuthedRequest extends Request { user?: {id:string;role:string;email:string} }
export async function auth(req:AuthedRequest,res:Response,next:NextFunction){
  const h=req.headers.authorization;
  if(!h?.startsWith("Bearer ")) return res.status(401).json({success:false,message:"Authentication required",code:"AUTH_REQUIRED"});
  try{
    const payload:any=jwt.verify(h.slice(7),env.JWT_SECRET);
    const u:any=await User.findById(payload.id).select("_id role email active");
    if(!u?.active) return res.status(401).json({success:false,message:"Account is disabled",code:"ACCOUNT_DISABLED"});
    req.user={id:u._id.toString(),role:u.role,email:u.email};
    next();
  }catch{return res.status(401).json({success:false,message:"Invalid or expired token",code:"AUTH_INVALID"});}
}
export const roles=(...allowed:string[]) => (req:AuthedRequest,res:Response,next:NextFunction) => {
  if(!req.user || !allowed.includes(req.user.role)) return res.status(403).json({success:false,message:"Forbidden",code:"FORBIDDEN"});
  next();
};
