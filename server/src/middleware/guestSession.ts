import crypto from "crypto";

function hashToken(token:string){
  return crypto.createHash("sha256").update(token).digest("hex");
}

function setCookie(res:any,name:string,value:string,maxAge:number){
  const secure=process.env.NODE_ENV==="production";
  const cookie=[
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${Math.floor(maxAge/1000)}`,
    "HttpOnly",
    "SameSite=None",
    ...(secure?["Secure"]:[])
  ].join("; ");

  const previous=res.getHeader("Set-Cookie");
  res.setHeader(
    "Set-Cookie",
    previous
      ? (Array.isArray(previous)?[...previous,cookie]:[previous,cookie])
      : [cookie]
  );
}

export function guestSession(req:any,res:any,next:any){
  let token=String(req.cookies?.nc_guest||"").trim();

  if(!/^[a-f0-9]{64}$/i.test(token)){
    token=crypto.randomBytes(32).toString("hex");
    setCookie(res,"nc_guest",token,30*24*60*60*1000);
  }

  req.guestToken=token;
  req.guestTokenHash=hashToken(token);
  next();
}

export function guestHash(token:string){
  return hashToken(token);
}
