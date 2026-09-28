import{Router}from"express";import * as c from"../controllers/withdrawals.controller";import{auth,roles}from"../middleware/auth";import{validate}from"../middleware/validation";import{withdrawalRequestSchema,withdrawalTransitionSchema,emptyRequestSchema}from"../validators/common";
const r=Router();
r.get("/mine",auth,validate(emptyRequestSchema),c.mine);
r.post("/",auth,validate(withdrawalRequestSchema),c.request);
r.get("/admin",auth,roles("admin","super_admin"),c.adminList);
r.patch("/:id/status",auth,roles("admin","super_admin"),validate(withdrawalTransitionSchema),c.transition);
export default r;
