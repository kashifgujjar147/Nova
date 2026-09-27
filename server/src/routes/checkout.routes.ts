import{Router}from"express";
import*as c from"../controllers/checkout.controller";
import{auth}from"../middleware/auth";
import{guestSession}from"../middleware/guestSession";
import{validate}from"../middleware/validation";
import{checkoutSchema,checkoutPreviewSchema}from"../validators/common";

const r=Router();

r.get("/preview",auth,validate(checkoutPreviewSchema),c.preview);
r.post("/",auth,validate(checkoutSchema),c.create);

r.get("/guest/preview",guestSession,validate(checkoutPreviewSchema),c.guestPreview);
r.post("/guest",guestSession,validate(checkoutSchema),c.guestCreate);

export default r;
