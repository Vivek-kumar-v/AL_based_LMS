import { Router } from "express";
import { registerStudent } from "../controllers/student.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerStudent);

export default router;

