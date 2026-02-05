import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { markConceptRevised } from "../controllers/revision.controller.js";

const router = Router();

router.route("/:conceptId").post(verifyJWT, markConceptRevised);

export default router;
