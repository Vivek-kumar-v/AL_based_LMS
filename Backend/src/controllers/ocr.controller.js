import axios from "axios";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/Document.model.js";
import { Concept } from "../models/concept.model.js";

const processDocumentOCR = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
  
    // =========================
    // VALIDATE DOCUMENT ID
    // =========================
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID");
    }
  
    const document = await Document.findById(documentId);
  
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
  
    if (document.processingStatus === "processed") {
      return res.status(200).json(
        new ApiResponse(200, document, "Document already processed")
      );
    }
  
    // =========================
    // NORMALIZE FILE TYPE (IMPORTANT FIX)
    // =========================
    let normalizedFileType;
  
    if (document.fileType === "raw") {
      normalizedFileType = "pdf";
    } else if (document.fileType === "image") {
      normalizedFileType = "image";
    } else {
      throw new ApiError(400, "Unsupported file type for OCR");
    }
  
    // =========================
    // CALL PYTHON OCR SERVICE
    // =========================
    let ocrResponse;
    try {
      ocrResponse = await axios.post(
        "http://127.0.0.1:8001/ocr",
        {
          fileUrl: document.fileUrl,
          fileType: normalizedFileType,
        },
        {
          timeout: 60000, // OCR can be slow
        }
      );
    } catch (err) {
      console.error("===== OCR SERVICE ERROR =====");
      console.error("Message:", err.message);
      console.error("Status:", err.response?.status);
      console.error("Data:", err.response?.data);
  
      document.processingStatus = "failed";
      await document.save();
  
      throw new ApiError(500, "OCR service failed");
    }
  
    const { rawText, cleanedText, concepts } = ocrResponse.data;
  
    // =========================
    // SAVE OCR RESULT
    // =========================
    document.rawText = rawText;
    document.cleanedText = cleanedText;
    document.processingStatus = "processed";
    document.processedAt = new Date();
  
    // =========================
    // SAVE CONCEPTS
    // =========================
    const conceptIds = [];
  
    for (const conceptName of concepts) {
      const concept = await Concept.findOneAndUpdate(
        { name: conceptName, subject: document.subject },
        { $setOnInsert: { name: conceptName, subject: document.subject } },
        { upsert: true, new: true }
      );
      conceptIds.push(concept._id);
    }
  
    document.extractedConcepts = conceptIds;
  
    await document.save();
  
    return res.status(200).json(
      new ApiResponse(200, document, "OCR processing completed successfully")
    );
  });
  

export { processDocumentOCR };
