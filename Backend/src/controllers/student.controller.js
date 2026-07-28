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


  if (!fullName || !email || !password || !username) {
    throw new ApiError(400, "All required fields must be provided");
  }


  const existingStudent = await Student.findOne({
    $or: [{ email }, { username }],
  });

  if (existingStudent) {
    throw new ApiError(
      409,
      "Student with given email or username already exists"
    );
  }


  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar?.url) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

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


  const createdStudent = await Student.findById(student._id).select(
    "-password -refreshToken"
  );

  if (!createdStudent) {
    throw new ApiError(500, "Failed to retrieve created student");
  }


  return res.status(201).json(
    new ApiResponse(201, createdStudent, "Student registered successfully")
  );
});


const loginStudent = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username) || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const student = await Student.findOne({
    $or: [{ email }, { username }],
  }).select("+password"); 

  if (!student) {
    throw new ApiError(404, "Student does not exist");
  }

  const isPasswordValid = await student.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }


  const accessToken = student.generateAccessToken();
  const refreshToken = student.generateRefreshToken();


  student.refreshToken = refreshToken;
  await student.save({ validateBeforeSave: false });


  const loggedInStudent = await Student.findById(student._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  

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
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          };
          
    
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

const getStudentProfile = asyncHandler(async (req, res) => {
    const studentId = req.student?._id;
  
    if (!studentId) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const student = await Student.findById(studentId).select(
      "-password -refreshToken"
    );
  
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  
    return res.status(200).json(
      new ApiResponse(200, student, "Student profile fetched successfully")
    );
  });

  const updateStudentProfile = asyncHandler(async (req, res) => {
    const studentId = req.student?._id;
  
    if (!studentId) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const {
      fullName,
      username,
      collegeName,
      department,
      semester,
      avatar,
    } = req.body;
  
    // Find current student
    const student = await Student.findById(studentId);
  
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  
    // ✅ If username is being updated → check uniqueness
    if (username && username !== student.username) {
      const existingUsername = await Student.findOne({ username });
  
      if (existingUsername) {
        throw new ApiError(409, "Username already taken");
      }
    }
  
    // ✅ Update only fields provided
    if (fullName !== undefined) student.fullName = fullName;
    if (username !== undefined) student.username = username;
    if (collegeName !== undefined) student.collegeName = collegeName;
    if (department !== undefined) student.department = department;
    if (semester !== undefined) student.semester = semester;
  
    // Avatar URL (Cloudinary)
    if (avatar !== undefined) student.avatar = avatar;
  
    await student.save({ validateBeforeSave: false });
  
    const updatedStudent = await Student.findById(studentId).select(
      "-password -refreshToken"
    );
  
    return res
      .status(200)
      .json(new ApiResponse(200, { student: updatedStudent }, "Profile updated successfully"));
  });

  const uploadStudentAvatar = asyncHandler(async (req, res) => {
    const studentId = req.student?._id;
  
    if (!studentId) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const avatarLocalPath = req.file?.path;
  
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath);
  
    if (!avatar?.url) {
      throw new ApiError(500, "Failed to upload avatar");
    }
  
    return res.status(200).json(
      new ApiResponse(
        200,
        { avatarUrl: avatar.url },
        "Avatar uploaded successfully"
      )
    );
  });
  
  const changeStudentPassword = asyncHandler(async (req, res) => {
    const studentId = req.student?._id;
  
    if (!studentId) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const { oldPassword, newPassword } = req.body;
    console.log(oldPassword)
  
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, "Old password and new password are required");
    }
  
    if (newPassword.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }
  
    const student = await Student.findById(studentId).select("+password");
  
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  
    const isOldPasswordCorrect = await student.isPasswordCorrect(oldPassword);
  
    if (!isOldPasswordCorrect) {
      throw new ApiError(401, "Old password is incorrect");
    }
  
    student.password = newPassword;
  
    await student.save();
  
    return res.status(200).json(
      new ApiResponse(200, null, "Password updated successfully")
    );
  });
  
  const deleteStudentAccount = asyncHandler(async (req, res) => {
    const studentId = req.student?._id;
  
    if (!studentId) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const student = await Student.findById(studentId);
  
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  
    await Student.findByIdAndDelete(studentId);
  
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
  
    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, null, "Account deleted successfully"));
  });
  

export { registerStudent ,loginStudent,logoutStudent,refreshAccessToken,getStudentProfile, updateStudentProfile, uploadStudentAvatar, changeStudentPassword, deleteStudentAccount };
