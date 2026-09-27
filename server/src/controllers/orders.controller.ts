import * as s from "../services/orders.service";
import {ok} from "../utils/response";

export const mine=async(q:any,r:any)=>
  ok(r,await s.mine(q.user.id));

export const get=async(q:any,r:any)=>{
  const x=await s.get(q.params.id,q.user.id);
  if(!x)
    return r.status(404).json({
      success:false,
      message:"Order not found"
    });
  return ok(r,x);
};

export const guestGet=async(q:any,r:any)=>{
  const x=await s.getGuest(
    q.params.id,
    q.guestTokenHash
  );

  if(!x)
    return r.status(404).json({
      success:false,
      message:"Guest order not found"
    });

  return ok(r,x);
};

export const adminList=async(q:any,r:any)=>
  ok(r,await s.list(q.query));

export const status=async(q:any,r:any)=>{
  const x=await s.status(
    q.params.id,
    q.body.status,
    q.user.id,
    q.user.role
  );
  return ok(r,x);
};

export const cancel=async(q:any,r:any)=>{
  const x=await s.status(
    q.params.id,
    "CANCELLED",
    q.user.id,
    q.user.role
  );
  return ok(r,x);
};
