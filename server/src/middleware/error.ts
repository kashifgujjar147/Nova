export function errorHandler(err:any,_req:any,res:any,_next:any){
 const status=Number(err.status||err.statusCode)||500;
 if(err?.code===11000)return res.status(409).json({success:false,message:"A record with that unique value already exists",code:"DUPLICATE"});
 if(status>=500)console.error(err);
 return res.status(status).json({success:false,message:status>=500?"Internal server error":String(err.message||"Request failed"),code:err.code||"REQUEST_ERROR"});
}
