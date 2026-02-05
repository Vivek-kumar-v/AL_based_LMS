import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Concept } from "../models/concept.model.js";
import { Document } from "../models/Document.model.js";
import { Student } from "../models/student.model.js";
import { normalizeConceptName } from "../utils/conceptNormalizer.js";


export const getAllConcepts = asyncHandler(async (req, res) => {
  const { subject, keyword, page = 1, limit = 20 } = req.query;

  const filters = {};

  if (subject) filters.subject = subject;

  // Keyword search
  if (keyword) {
    filters.$or = [
      { displayName: { $regex: keyword, $options: "i" } },
      { normalizedName: { $regex: normalizeConceptName(keyword), $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const concepts = await Concept.find(filters)
    .sort({ importanceScore: -1, frequencyInPYQ: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("displayName normalizedName subject importanceScore frequencyInPYQ createdAt");

  const total = await Concept.countDocuments(filters);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: Number(page),
        limit: Number(limit),
        concepts,
      },
      "Concepts fetched successfully"
    )
  );
});


export const getConceptDetails = asyncHandler(async (req, res) => {
  const { conceptId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conceptId)) {
    throw new ApiError(400, "Invalid concept ID");
  }

  const concept = await Concept.findById(conceptId).select(
    "displayName normalizedName subject description importanceScore frequencyInPYQ relatedConcepts createdAt"
  );

  if (!concept) {
    throw new ApiError(404, "Concept not found");
  }

  // Find documents linked to this concept
  const relatedDocuments = await Document.find({
    extractedConcepts: concept._id,
    processingStatus: "processed",
    isPublic: true,
  })
    .sort({ createdAt: -1 })
    .select("title documentType subject semester year fileUrl createdAt uploadedBy")
    .populate("uploadedBy", "fullName username avatar");

  return res.status(200).json(
    new ApiResponse(
      200,
      { concept, relatedDocuments },
      "Concept details fetched successfully"
    )
  );
});


export const getTopPYQConcepts = asyncHandler(async (req, res) => {
  const { subject, limit = 10 } = req.query;

  const filters = {};
  if (subject) filters.subject = subject;

  const concepts = await Concept.find(filters)
    .sort({ frequencyInPYQ: -1, importanceScore: -1 })
    .limit(Number(limit))
    .select("displayName subject frequencyInPYQ importanceScore");

  return res.status(200).json(
    new ApiResponse(200, concepts, "Top PYQ concepts fetched successfully")
  );
});


export const getWeakConceptsForStudent = asyncHandler(async (req, res) => {
  const student = req.student;

  if (!student) {
    throw new ApiError(401, "Unauthorized");
  }

  const fullStudent = await Student.findById(student._id)
    .populate("conceptStats.conceptId", "displayName subject importanceScore frequencyInPYQ")
    .select("conceptStats");

  if (!fullStudent) {
    throw new ApiError(404, "Student not found");
  }

  const weakConcepts = fullStudent.conceptStats
    .filter((c) => c.strengthScore <= 40)
    .sort((a, b) => a.strengthScore - b.strengthScore)
    .slice(0, 15);

  return res.status(200).json(
    new ApiResponse(200, weakConcepts, "Weak concepts fetched successfully")
  );
});
