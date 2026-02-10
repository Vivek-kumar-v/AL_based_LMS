import { Router } from "express";
import { changeStudentPassword, deleteStudentAccount, getStudentProfile, loginStudent, logoutStudent, refreshAccessToken, registerStudent, updateStudentProfile, uploadStudentAvatar } from "../controllers/student.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.single("avatar"),
    registerStudent);


router.route("/login").post(loginStudent)
router.route("/profile").get(verifyJWT,getStudentProfile);

router.put("/update-profile", verifyJWT, updateStudentProfile);

router.put("/change-password", verifyJWT, changeStudentPassword);

router.delete("/delete-account", verifyJWT, deleteStudentAccount);


router.post(
  "/upload-avatar",
  verifyJWT,
  upload.single("avatar"),
  uploadStudentAvatar
);


// secured routes
router.route("/logout").post(verifyJWT ,logoutStudent)
router.route("/refresh-token").post(refreshAccessToken)

export default router;

