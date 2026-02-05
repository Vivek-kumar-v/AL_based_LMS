import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { Concept } from "../models/concept.model.js";

/**
 * POST /api/v1/revision/:conceptId
 */
export const markConceptRevised = asyncHandler(async (req, res) => {
  const student = req.student;
  const { conceptId } = req.params;

  if (!student) throw new ApiError(401, "Unauthorized");

  if (!mongoose.Types.ObjectId.isValid(conceptId)) {
    throw new ApiError(400, "Invalid concept ID");
  }

  const concept = await Concept.findById(conceptId);

  if (!concept) {
    throw new ApiError(404, "Concept not found");
  }

  // Add revision entry
  await Student.findByIdAndUpdate(student._id, {
    $push: {
      revisionHistory: {
        conceptId: concept._id,
        revisedAt: new Date(),
      },
    },
  });

  return res.status(200).json(
    new ApiResponse(200, { conceptId }, "Concept marked as revised")
  );
});
