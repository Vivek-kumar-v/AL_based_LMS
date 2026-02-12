import axios from "axios";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/Document.model.js";
import { Concept } from "../models/concept.model.js";
import { normalizeConceptName } from "../utils/conceptNormalizer.js";
import { Student } from "../models/student.model.js";

const processDocumentOCR = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  console.log("api hit: ")
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
    const OCR_URL = process.env.OCR_SERVER_URL;
    if (!OCR_URL) {
      throw new ApiError(500, "OCR_SERVER_URL is missing in .env");
    }
    console.log(OCR_URL)
    ocrResponse = await axios.post(
      `${OCR_URL}/ocr/`,
      {
        fileUrl: document.fileUrl,
        fileType: normalizedFileType,
      },
      {
        timeout: 600000,
      }
    );
    console.log('====================================');
    console.log("Ocr success");
    console.log('====================================');
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
  const oldConceptIds = document.extractedConcepts || [];
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

  // ✅ UPDATE frequencyInPYQ ONLY FOR PYQ DOCUMENTS
    if (document.documentType === "pyq") {
      // 1) Decrease old concepts (if OCR rerun)
      if (oldConceptIds.length > 0) {
        await Concept.updateMany(
          { _id: { $in: oldConceptIds } },
          { $inc: { frequencyInPYQ: -1 } }
        );
      }

      // 2) Increase new concepts
      if (conceptIds.length > 0) {
        await Concept.updateMany(
          { _id: { $in: conceptIds } },
          { $inc: { frequencyInPYQ: 1 } }
        );
      }
    }

  document.extractedConcepts = conceptIds;
  // ✅ UPDATE STUDENT CONCEPT STATS (for weak concepts feature)
  const studentId = req.student?._id;

  if (studentId && conceptIds.length > 0) {
    for (const conceptId of conceptIds) {
      await Student.updateOne(
        { _id: studentId, "conceptStats.conceptId": { $ne: conceptId } },
        {
          $push: {
            conceptStats: {
              conceptId,
              strengthScore: 30,
              lastSeenAt: new Date(),
            },
          },
        }
      );
  
      await Student.updateOne(
        { _id: studentId, "conceptStats.conceptId": conceptId },
        {
          $set: { "conceptStats.$.lastSeenAt": new Date() },
        }
      );
    }
  }
  


  await document.save();

  // RETURN POPULATED DOCUMENT
  const populatedDocument = await Document.findById(document._id)
    .populate("extractedConcepts", "displayName subject importanceScore frequencyInPYQ")
    .select("+rawText +cleanedText +llmText");

    await Student.findByIdAndUpdate(document.uploadedBy, {
      $inc: { "activityStats.aiQueries": 1 },
    });
    

  return res.status(200).json(
    new ApiResponse(
      200,
      populatedDocument,
      "OCR processing completed successfully"
    )
  );
});

export { processDocumentOCR };
