import {
  createOrder,
  previewOrder,
  createGuestOrder,
  previewGuestOrder
} from "../services/checkout.service";
import {ok} from "../utils/response";

export const preview=async(req:any,res:any)=>
  ok(res,await previewOrder(req.user.id,req.query.coupon));

export const create=async(req:any,res:any)=>
  ok(
    res,
    await createOrder(
      req.user.id,
      req.body,
      req.cookies?.nc_aff,
      req.headers["idempotency-key"]||req.headers["x-idempotency-key"]
    ),
    "Order created",
    201
  );

export const guestPreview=async(req:any,res:any)=>
  ok(res,await previewGuestOrder(req.guestTokenHash,req.query.coupon));

export const guestCreate=async(req:any,res:any)=>
  ok(
    res,
    await createGuestOrder(
      req.guestTokenHash,
      req.body,
      req.headers["idempotency-key"]||req.headers["x-idempotency-key"]
    ),
    "Guest order created",
    201
  );
