import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Student } from "../models/student.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const student = await Student.findById(userId)
        const accessToken = student.generateAccessToken()
        const refreshToken = student.generateRefreshToken()

        student.refreshToken = refreshToken
        await student.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


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
  const avatarLocalPath = req.file?.path;

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


const loginStudent = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;


  // VALIDATION
  if (!(email || username) || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  // FIND STUDENT
  const student = await Student.findOne({
    $or: [{ email }, { username }],
  }).select("+password"); // password is select:false (recommended)

  if (!student) {
    throw new ApiError(404, "Student does not exist");
  }


  // PASSWORD CHECK
  const isPasswordValid = await student.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }


  // TOKEN GENERATION
  const accessToken = student.generateAccessToken();
  const refreshToken = student.generateRefreshToken();


  // SAVE REFRESH TOKEN
  student.refreshToken = refreshToken;
  await student.save({ validateBeforeSave: false });


  // REMOVE SENSITIVE DATA
  const loggedInStudent = await Student.findById(student._id).select(
    "-password -refreshToken"
  );

  // COOKIE OPTIONS
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };


  // RESPONSE
  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          student: loggedInStudent,
          accessToken,
          refreshToken,
        },
        "Student logged in successfully"
      )
    );
});


const logoutStudent = asyncHandler(async (req, res) => {
  await Student.findByIdAndUpdate(req.student._id, 
    {
        $set: { refreshToken: undefined }
    },
    {
        new: true,
    }
  );


  const cookieOptions = {
    httpOnly: true,
    secure: true,
  }

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, null, "Student logged out successfully")
        );

});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
        throw new ApiError(401, "Unauthorized! No refresh token provided");
    }

    // VERIFY REFRESH TOKEN AND ISSUE NEW ACCESS TOKEN LOGIC HERE
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )

    try {
        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const student = await Student.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!student || student.refreshToken !== refreshToken) {
            throw new ApiError(401, "Unauthorized! Invalid refresh token");
        }
    
        if(refreshToken !== student?.refreshToken) {
            throw new ApiError(401, "Unauthorized! Refresh token mismatch");
        }
    
        const cookieOptions = {
            httpOnly: true,
            secure: true,
          }
    
          const {accessToken, refreshToken1 } = await generateAccessAndRefereshTokens(student._id)
    
          return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken1, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken : refreshToken1,
                    },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, "Unauthorized! " + error.message);
        
    }

});


export { registerStudent ,loginStudent,logoutStudent,refreshAccessToken};
