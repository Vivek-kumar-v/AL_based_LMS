import { Router } from "express";
import { smartSearchDocuments } from "../controllers/search.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/documents").get(verifyJWT,smartSearchDocuments);

export default router;
