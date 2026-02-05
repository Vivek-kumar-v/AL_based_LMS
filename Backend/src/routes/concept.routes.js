import { Router } from "express";
import {
  getAllConcepts,
  getConceptDetails,
  getTopPYQConcepts,
  getWeakConceptsForStudent,
} from "../controllers/concept.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected
router.route("/weak").get(verifyJWT, getWeakConceptsForStudent);

// Public
router.route("/").get(getAllConcepts);
router.route("/top-pyq").get(getTopPYQConcepts);
router.route("/:conceptId").get(getConceptDetails);



export default router;
