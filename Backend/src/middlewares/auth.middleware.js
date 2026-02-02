import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { Student } from "../models/student.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized! No token provided")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const student = await Student.findById(decodedToken?._id).select("-password -refreshToken");
        if (!student) {
            throw new ApiError(401, "Unauthorized! Invalid token")
        }
    
        req.student = student;
        next();
    } catch (error) {
        throw new ApiError(401, "Unauthorized! " + error.message)
        
    }

});