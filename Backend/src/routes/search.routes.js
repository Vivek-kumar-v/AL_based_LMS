import { Router } from "express";
import { smartSearchDocuments } from "../controllers/search.controller.js";

const router = Router();

router.route("/documents").get(smartSearchDocuments);

export default router;
