import { AnyZodObject } from "zod";
export const validate=(schema:AnyZodObject)=>(req:any,res:any,next:any)=>{
  const result=schema.safeParse({body:req.body,query:req.query,params:req.params});
  if(!result.success) return res.status(400).json({success:false,message:"Invalid request",code:"VALIDATION_ERROR",issues:result.error.flatten()});
  req.body=result.data.body??req.body; req.query=result.data.query??req.query; req.params=result.data.params??req.params; next();
};
