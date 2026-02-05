import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { Concept } from "../models/concept.model.js";

/**
 * GET /api/v1/dashboard
 * Protected Route (verifyJWT required)
 */
export const getStudentDashboard = asyncHandler(async (req, res) => {
  const student = req.student;

  if (!student) {
    throw new ApiError(401, "Unauthorized");
  }

  // Refresh student with conceptStats + revisionHistory
  const fullStudent = await Student.findById(student._id)
    .populate("conceptStats.conceptId", "displayName subject importanceScore frequencyInPYQ")
    .populate("revisionHistory.conceptId", "displayName subject")
    .select("-password -refreshToken");

  if (!fullStudent) {
    throw new ApiError(404, "Student not found");
  }

  // 1️⃣ Weak Concepts (strengthScore <= 40)
  const weakConcepts = fullStudent.conceptStats
    .filter((c) => c.strengthScore <= 40)
    .sort((a, b) => a.strengthScore - b.strengthScore)
    .slice(0, 10);

  // 2️⃣ Most Repeated PYQ Concepts (global)
  const mostRepeatedPYQConcepts = await Concept.find({ subject: { $exists: true } })
    .sort({ frequencyInPYQ: -1 })
    .limit(10)
    .select("displayName subject frequencyInPYQ importanceScore");

  // 3️⃣ Revision Tracker (last 7 days)
  const last7Days = fullStudent.revisionHistory
    .sort((a, b) => new Date(b.revisedAt) - new Date(a.revisedAt))
    .slice(0, 20);

  // 4️⃣ Summary counts
  const summary = {
    totalConceptsTracked: fullStudent.conceptStats.length,
    totalRevisions: fullStudent.revisionHistory.length,
    totalSearches: fullStudent.activityStats.searches,
    totalUploads: fullStudent.activityStats.uploads,
    totalAIQueries: fullStudent.activityStats.aiQueries,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary,
        weakConcepts,
        mostRepeatedPYQConcepts,
        last7DaysRevisions: last7Days,
      },
      "Dashboard fetched successfully"
    )
  );
});
