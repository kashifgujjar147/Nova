import {Router} from "express";
import * as c from "../controllers/cart.controller";
import {auth} from "../middleware/auth";
import {guestSession} from "../middleware/guestSession";
import {validate} from "../middleware/validation";
import {cartSchema} from "../validators/common";

const r=Router();

r.get("/",auth,c.get);
r.put("/",auth,validate(cartSchema),c.save);

r.get("/guest",guestSession,c.get);
r.put("/guest",guestSession,validate(cartSchema),c.save);

export default r;
