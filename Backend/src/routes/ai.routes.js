import { Router } from "express";
import { askQuestion } from "../controllers/ai.controller.js";
import {askQuestionFromAllNotes} from "../controllers/ai.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Ask questions from uploaded notes
router.post("/ask", askQuestion);
router.post(
    "/ask-all",
    verifyJWT,
    askQuestionFromAllNotes
);

export default router;