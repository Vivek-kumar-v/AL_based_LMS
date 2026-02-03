import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteDocument, getAllNotes, getAllPYQs, getDocumentById, searchDocuments, updateDocument, uploadDocument } from "../controllers/Document.controller.js";
import { processDocumentOCR } from "../controllers/ocr.controller.js";

const router = Router();

router.post(
  "/upload",
  verifyJWT,
  upload.single("document"),
  uploadDocument
);

router.post(
    "/:documentId/ocr",
    verifyJWT,
    processDocumentOCR
  );

router.get("/notes", verifyJWT, getAllNotes);
router.get("/pyqs", verifyJWT, getAllPYQs);
router.get("/search", verifyJWT, searchDocuments);

router.get("/:documentId", verifyJWT, getDocumentById);
router.delete("/:documentId", verifyJWT, deleteDocument);

router.patch(
    "/:documentId",
    verifyJWT,
    updateDocument
  );
  

  
  
  

export default router;
