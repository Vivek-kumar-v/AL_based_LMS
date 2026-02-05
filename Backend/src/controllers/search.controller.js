import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Document } from "../models/Document.model.js";
import { Concept } from "../models/concept.model.js";
import { normalizeConceptName } from "../utils/conceptNormalizer.js";

/**
 * GET /api/v1/search/documents?keyword=&subject=&semester=&documentType=&concept=
 */
export const smartSearchDocuments = asyncHandler(async (req, res) => {
  const { keyword, subject, semester, documentType, concept } = req.query;

  const filters = {
    isPublic: true,
    processingStatus: "processed",
  };

  // Filter by subject
  if (subject) {
    filters.subject = subject;
  }

  // Filter by semester
  if (semester) {
    filters.semester = Number(semester);
  }

  // Filter by documentType (notes/pyq)
  if (documentType) {
    filters.documentType = documentType;
  }

  // Filter by concept (concept name from user)
  if (concept) {
    const normalized = normalizeConceptName(concept);

    const conceptDoc = await Concept.findOne({
      normalizedName: normalized,
      ...(subject ? { subject } : {}),
    });

    if (!conceptDoc) {
      return res.status(200).json(
        new ApiResponse(200, [], "No documents found for this concept")
      );
    }

    filters.extractedConcepts = conceptDoc._id;
  }

  // Keyword search (title + description)
  if (keyword) {
    filters.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  const documents = await Document.find(filters)
    .sort({ createdAt: -1 })
    .populate("uploadedBy", "fullName username avatar")
    .populate("extractedConcepts", "displayName subject")
    .select("-rawText -cleanedText -llmText");

  return res.status(200).json(
    new ApiResponse(200, documents, "Search results fetched successfully")
  );
});
