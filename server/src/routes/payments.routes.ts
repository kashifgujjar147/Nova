import {Router}from"express";
import * as c from"../controllers/payments.controller";
import {auth,roles}from"../middleware/auth";
import {guestSession}from"../middleware/guestSession";
import {validate}from"../middleware/validation";
import {paymentSchema,paymentReviewSchema,paymentIdSchema}from"../validators/common";

const r=Router();

r.post("/",auth,validate(paymentSchema),c.submit);
r.post("/guest",guestSession,validate(paymentSchema),c.guestSubmit);

r.get("/",auth,roles("admin","super_admin"),c.list);
r.patch("/:id/review",auth,roles("admin","super_admin"),validate(paymentReviewSchema),c.review);
r.post("/:id/collect-cod",auth,roles("admin","super_admin"),validate(paymentIdSchema),c.collectCOD);
r.post("/:id/refund",auth,roles("admin","super_admin"),validate(paymentIdSchema),c.refund);

export default r;
