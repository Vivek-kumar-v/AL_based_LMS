import axios from "axios";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/Document.model.js";
import { Concept } from "../models/concept.model.js";
import { normalizeConceptName } from "../utils/conceptNormalizer.js";

const processDocumentOCR = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  // VALIDATE DOCUMENT ID
  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    throw new ApiError(400, "Invalid document ID");
  }

  const document = await Document.findById(documentId);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  if (document.processingStatus === "processed") {
    return res
      .status(200)
      .json(new ApiResponse(200, document, "Document already processed"));
  }

  // NORMALIZE FILE TYPE
  let normalizedFileType;

  if (document.fileType === "pdf") {
    normalizedFileType = "pdf";
  } else if (document.fileType === "image") {
    normalizedFileType = "image";
  } else {
    throw new ApiError(400, "Unsupported file type for OCR");
  }

  // CALL PYTHON OCR SERVICE
  let ocrResponse;
  try {
    ocrResponse = await axios.post(
      "http://127.0.0.1:8001/ocr/",
      {
        fileUrl: document.fileUrl,
        fileType: normalizedFileType,
      },
      {
        timeout: 600000,
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

  const { rawText, cleanedText, llmText, concepts } = ocrResponse.data;

  // SAVE OCR RESULT
  document.rawText = rawText;
  document.llmText = llmText;
  document.cleanedText = cleanedText;
  document.processingStatus = "processed";
  document.processedAt = new Date();

  // SAVE CONCEPTS (NORMALIZED)
  const conceptIds = [];

  for (const conceptName of concepts) {
    const normalized = normalizeConceptName(conceptName);

    // Skip junk concepts
    if (!normalized || normalized.length < 3) continue;

    const concept = await Concept.findOneAndUpdate(
      { normalizedName: normalized, subject: document.subject },
      {
        $setOnInsert: {
          displayName: conceptName.trim().replace(/\s+/g, " "),
          normalizedName: normalized,
          subject: document.subject,
        },
      },
      { upsert: true, new: true }
    );

    conceptIds.push(concept._id);
  }

  document.extractedConcepts = conceptIds;

  await document.save();

  // RETURN POPULATED DOCUMENT
  const populatedDocument = await Document.findById(document._id)
    .populate("extractedConcepts", "displayName subject importanceScore frequencyInPYQ")
    .select("+rawText +cleanedText +llmText");

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedDocument,
      "OCR processing completed successfully"
    )
  );
});

export { processDocumentOCR };
