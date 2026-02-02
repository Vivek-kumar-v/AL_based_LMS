import { Router } from "express";
import { loginStudent, logoutStudent, refreshAccessToken, registerStudent } from "../controllers/student.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerStudent);


router.route("/login").post(loginStudent)


// secured routes
router.route("/logout").post(verifyJWT ,logoutStudent)
router.route("/refresh-token").post(refreshAccessToken)

export default router;

