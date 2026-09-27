import * as s from "../services/payments.service";
import{ok}from"../utils/response";

export const submit=async(q:any,r:any)=>
  ok(
    r,
    await s.submit(
      q.user.id,
      q.body,
      q.headers["idempotency-key"]||q.headers["x-idempotency-key"]
    ),
    "Payment submitted",
    201
  );

export const guestSubmit=async(q:any,r:any)=>
  ok(
    r,
    await s.submitGuest(
      q.guestTokenHash,
      q.body,
      q.headers["idempotency-key"]||q.headers["x-idempotency-key"]
    ),
    "Guest payment submitted",
    201
  );

export const list=async(q:any,r:any)=>
  ok(r,await s.list(q.query));

export const review=async(q:any,r:any)=>
  ok(r,await s.review(q.params.id,q.user.id,q.body.status,q.body.note));

export const collectCOD=async(q:any,r:any)=>
  ok(r,await s.collectCOD(q.params.id,q.user.id),"COD collected");

export const refund=async(q:any,r:any)=>
  ok(r,await s.refund(q.params.id,q.user.id),"Refunded");
