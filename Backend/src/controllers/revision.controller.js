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

  if (!student) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!mongoose.Types.ObjectId.isValid(conceptId)) {
    throw new ApiError(400, "Invalid concept ID");
  }

  const concept = await Concept.findById(conceptId);

  if (!concept) {
    throw new ApiError(404, "Concept not found");
  }

  const now = new Date();

  // Find student's concept statistics
  const fullStudent = await Student.findById(student._id).select(
    "conceptStats"
  );

  if (!fullStudent) {
    throw new ApiError(404, "Student not found");
  }

  const conceptStat = fullStudent.conceptStats.find(
    (c) => c.conceptId.toString() === conceptId
  );

  if (!conceptStat) {
    throw new ApiError(
      404,
      "Concept is not being tracked for this student"
    );
  }

  // Increase strength by 20 points, maximum 100
  const newStrengthScore = Math.min(
    conceptStat.strengthScore + 20,
    100
  );

  const newRevisionCount = conceptStat.revisionCount + 1;

  // Update concept statistics
  await Student.updateOne(
    {
      _id: student._id,
      "conceptStats.conceptId": concept._id,
    },
    {
      $set: {
        "conceptStats.$.strengthScore": newStrengthScore,
        "conceptStats.$.lastRevisedAt": now,
      },
      $inc: {
        "conceptStats.$.revisionCount": 1,
      },
      $push: {
        revisionHistory: {
          conceptId: concept._id,
          revisedAt: now,
        },
      },
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        conceptId,
        strengthScore: newStrengthScore,
        revisionCount: newRevisionCount,
      },
      "Concept revised successfully"
    )
  );
});