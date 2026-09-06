import axios from "axios";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/Document.model.js";
import { Concept } from "../models/concept.model.js";
import { normalizeConceptName } from "../utils/conceptNormalizer.js";
import { Student } from "../models/student.model.js";
import { DocumentChunk } from "../models/DocumentChunk.js"
import dotenv from "dotenv";
dotenv.config();

const processDocumentOCR = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  console.log("Requested documentId:", req.params.documentId);

  if (!mongoose.Types.ObjectId.isValid(documentId)) {
    return res.status(500).json(new ApiError(400, "Invalid document ID"));
  }

  const document = await Document.findById(documentId);

  if (!document) {
    return res.status(500).json(new ApiError(404, "Document not found"));
  }

  console.log("Loaded document:", document._id.toString());
  console.log("Title:", document.title);
  if (document.processingStatus === "processed") {
    return res
      .status(200)
      .json(new ApiResponse(200, document, "Document already processed"));
  }

  let normalizedFileType;

  if (document.fileType === "pdf") {
    normalizedFileType = "pdf";
  } else if (document.fileType === "image") {
    normalizedFileType = "image";
  } else {
    res.status(500).json(new ApiError(400, "Unsupported file type for OCR"));
  }

  let ocrResponse;
  try {
    const OCR_URL = process.env.OCR_SERVER_URL;
    if (!OCR_URL) {
      return res
        .status(500)
        .json(new ApiError(500, "OCR_SERVER_URL is missing in .env"));
    }
    console.log(OCR_URL);
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
  } catch (err) {
    console.log("OCR SERVICE ERROR:", err.message);

    document.processingStatus = "failed";
    document.processedAt = new Date();
    await document.save();

    const status = err?.response?.status || 500;
    const data = err?.response?.data || "OCR Service Failed";

    return res.status(status).json({
      success: false,
      message: "OCR Service Error",
      error: data,
    });
  }

  const { rawText, cleanedText, llmText, concepts, chunks } = ocrResponse.data;

  console.log("Chunks received:", chunks?.length);

  if (chunks?.length) {
      console.log("First chunk:", chunks[0]);
  }

  document.rawText = rawText;
  document.llmText = llmText;
  document.cleanedText = cleanedText;
  document.processingStatus = "processed";
  document.processedAt = new Date();

  const oldConceptIds = document.extractedConcepts || [];
  const conceptIds = [];

  for (const conceptName of concepts) {
    const normalized = normalizeConceptName(conceptName);

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

  if (document.documentType === "pyq") {
    if (oldConceptIds.length > 0) {
      await Concept.updateMany(
        { _id: { $in: oldConceptIds } },
        { $inc: { frequencyInPYQ: -1 } }
      );
    }

    if (conceptIds.length > 0) {
      await Concept.updateMany(
        { _id: { $in: conceptIds } },
        { $inc: { frequencyInPYQ: 1 } }
      );
    }
  }

  document.extractedConcepts = conceptIds;
  const studentId = req.student?._id;

  if (studentId && conceptIds.length > 0) {
    for (const conceptId of conceptIds) {
      await Student.updateOne(
        { _id: studentId, "conceptStats.conceptId": { $ne: conceptId } },
        {
          $push: {
            conceptStats: {
              conceptId,
              strengthScore: 0,
              revisionCount: 0,
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

  if (chunks && chunks.length > 0) {
    await DocumentChunk.deleteMany({
      documentId: document._id,
    });

    const chunkDocuments = chunks.map((chunk) => ({
      documentId: document._id,
      uploadedBy: document.uploadedBy,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      embedding: chunk.embedding,
      pageNumber: null,
    }));

    console.log("Saving", chunkDocuments.length, "chunks");
    console.log("Saving chunks for:", document._id.toString());
    await DocumentChunk.insertMany(chunkDocuments);
    console.log("Chunks saved successfully");
  }

  const populatedDocument = await Document.findById(document._id)
    .populate(
      "extractedConcepts",
      "displayName subject importanceScore frequencyInPYQ"
    )
    .select("+rawText +cleanedText +llmText");

  await Student.findByIdAndUpdate(document.uploadedBy, {
    $inc: { "activityStats.aiQueries": 1 },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedDocument,
        "OCR processing completed successfully"
      )
    );
});

export { processDocumentOCR };
