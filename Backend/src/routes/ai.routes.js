import { Router } from "express";
import { askQuestion } from "../controllers/ai.controller.js";

const router = Router();

// Ask questions from uploaded notes
router.post("/ask", askQuestion);

export default router;