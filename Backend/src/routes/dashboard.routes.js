import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getStudentDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getStudentDashboard);

export default router;
