import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerStudent = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    password,
    username,
    collegeName,
    department,
    semester,
    subjects,
    role,
  } = req.body;


  // VALIDATION
  if (!fullName || !email || !password || !username) {
    throw new ApiError(400, "All required fields must be provided");
  }


  // CHECK EXISTING STUDENT
  const existingStudent = await Student.findOne({
    $or: [{ email }, { username }],
  });

  if (existingStudent) {
    throw new ApiError(
      409,
      "Student with given email or username already exists"
    );
  }


  // AVATAR UPLOAD
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // CREATE STUDENT
  const student = await Student.create({
    fullName,
    email,
    username,
    password,
    avatar: avatar.url,
    collegeName,
    department,
    semester,
    subjects,
    role: role?.toLowerCase() || "student",
  });


  // REMOVE SENSITIVE DATA
  const createdStudent = await Student.findById(student._id).select(
    "-password -refreshToken"
  );

  if (!createdStudent) {
    throw new ApiError(500, "Failed to retrieve created student");
  }


  // RESPONSE
  return res.status(201).json(
    new ApiResponse(201, createdStudent, "Student registered successfully")
  );
});

export { registerStudent };
