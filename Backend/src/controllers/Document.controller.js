import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Document } from "../models/Document.model.js";
import { Concept } from "../models/concept.model.js";
import mongoose from "mongoose";
import { Student } from "../models/student.model.js";


const uploadDocument = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    documentType, // notes | pyq
    subject,
    semester,
    year,
    isPublic,
  } = req.body;

  const student = req.student;

  if (!student) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!title || !documentType || !subject) {
    throw new ApiError(400, "Title, Document Type and Subject are required");
  }

  const localFilePath = req.file?.path;
  const originalName = req.file?.originalname || "";

  if (!localFilePath) {
    throw new ApiError(400, "Document file is required");
  }

  const uploadResult = await uploadOnCloudinary(localFilePath);

  if (!uploadResult) {
    throw new ApiError(500, "Document upload failed, please try again");
  }

  const isPdf =
    originalName.toLowerCase().endsWith(".pdf") ||
    uploadResult.secure_url.toLowerCase().endsWith(".pdf");

  let normalizedFileType;


  if (isPdf) {
    normalizedFileType = "pdf";
  } else {
    normalizedFileType = "image";
  }

  const document = await Document.create({
    title,
    description,
    documentType,
    subject,
    semester,
    year,

    fileUrl: uploadResult.secure_url,
    fileType: normalizedFileType,

    uploadedBy: student._id,
    isPublic: isPublic ?? true,
    processingStatus: "pending",
  });

  await Student.findByIdAndUpdate(student._id, {
    $inc: { "activityStats.uploads": 1 },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      document,
      "Document uploaded successfully and queued for processing"
    )
  );
});

  

const getAllNotes = asyncHandler(async (req, res) => {
  const student = req.student;

  if (!student) {
    throw new ApiError(401, "Unauthorized request");
  }

  const { subject, semester } = req.query;

  const filter = {
    documentType: "notes",
    $or: [{ isPublic: true }, { uploadedBy: student._id }],
  };

  if (subject) {
    filter.subject = subject;
  }

  if (semester) {
    filter.semester = Number(semester);
  }

  const notes = await Document.find(filter)
    .select("-rawText -cleanedText") // exclude heavy fields
    .populate("uploadedBy", "fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const getDocumentById = asyncHandler(async (req, res) => {
  const student = req.student;
  const { documentId } = req.params;

  if (!student) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (!documentId) {
    throw new ApiError(400, "Document ID is required");
  }

  const document = await Document.findById(documentId)
    .populate("uploadedBy", "fullName avatar role")
    .populate("extractedConcepts", "name");

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const isOwner = document.uploadedBy._id.toString() === student._id.toString();

  if (!document.isPublic && !isOwner && student.role === "student") {
    throw new ApiError(403, "You do not have access to this document");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, document, "Document fetched successfully"));
});

const deleteDocument = asyncHandler(async (req, res) => {
    const student = req.student;
    const { documentId } = req.params;
  

    if (!student) {
      throw new ApiError(401, "Unauthorized request");
    }
  

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID");
    }
  

    const document = await Document.findById(documentId);
  
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
  

    const isOwner =
      document.uploadedBy.toString() === student._id.toString();
  
    const isAdminOrProfessor =
      student.role === "admin" || student.role === "Professor";
  
    if (!isOwner && !isAdminOrProfessor) {
      throw new ApiError(
        403,
        "You do not have permission to delete this document"
      );
    }
  

    await Document.findByIdAndDelete(documentId);
  
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Document deleted successfully"
      )
    );
  });

  const getAllPYQs = asyncHandler(async (req, res) => {
    const student = req.student;
  
    if (!student) {
      throw new ApiError(401, "Unauthorized request");
    }
  

    const { subject, year, semester } = req.query;
  
    const filter = {
      documentType: "pyq",
      $or: [
        { isPublic: true },
        { uploadedBy: student._id },
        { isVerified: true },
      ],
    };
  
    if (subject) {
      filter.subject = subject;
    }
  
    if (year) {
      filter.year = Number(year);
    }
  
    if (semester) {
      filter.semester = Number(semester);
    }
  

    const pyqs = await Document.find(filter)
      .select("-rawText -cleanedText")
      .populate("uploadedBy", "fullName role")
      .sort({ year: -1, createdAt: -1 });
  
    return res.status(200).json(
      new ApiResponse(
        200,
        pyqs,
        "PYQs fetched successfully"
      )
    );
  });


const searchDocuments = asyncHandler(async (req, res) => {
    const student = req.student;
  
    if (!student) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const {
      q,            // search text
      subject,
      documentType, // notes | pyq
      semester,
      year,
    } = req.query;
  

    const filter = {
      $or: [
        { isPublic: true },
        { uploadedBy: student._id },
      ],
    };
  

    if (subject) {
      filter.subject = subject;
    }
  
    if (documentType) {
      if (!["notes", "pyq"].includes(documentType)) {
        throw new ApiError(400, "Invalid documentType");
      }
      filter.documentType = documentType;
    }
  
    if (semester) {
      filter.semester = Number(semester);
    }
  
    if (year) {
      filter.year = Number(year);
    }
  

    if (q) {
      filter.$text = { $search: q };
    }
  

    const documents = await Document.find(filter)
      .select("-rawText -cleanedText")
      .populate("uploadedBy", "fullName role")
      .sort(
        q
          ? { score: { $meta: "textScore" } }
          : { createdAt: -1 }
      );
  
    return res.status(200).json(
      new ApiResponse(
        200,
        documents,
        "Search results fetched successfully"
      )
    );
  });

  const updateDocument = asyncHandler(async (req, res) => {
    const student = req.student;
    const { documentId } = req.params;
  
    if (!student) {
      throw new ApiError(401, "Unauthorized request");
    }
  

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID");
    }
  

    const document = await Document.findById(documentId);
  
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
  

    const isOwner =
      document.uploadedBy.toString() === student._id.toString();
  
    const isAdminOrProfessor =
      student.role === "admin" || student.role === "Professor";
  
    if (!isOwner && !isAdminOrProfessor) {
      throw new ApiError(
        403,
        "You do not have permission to update this document"
      );
    }
  

    const {
      title,
      description,
      subject,
      semester,
      year,
      isPublic,
      isVerified,
    } = req.body;
  
    if (title !== undefined) document.title = title;
    if (description !== undefined) document.description = description;
    if (subject !== undefined) document.subject = subject;
    if (semester !== undefined) document.semester = Number(semester);
    if (year !== undefined) document.year = Number(year);
    if (isPublic !== undefined) document.isPublic = isPublic;
  
    if (isVerified !== undefined) {
      if (!isAdminOrProfessor) {
        throw new ApiError(
          403,
          "Only admin or professor can verify documents"
        );
      }
      document.isVerified = isVerified;
    }
  

    await document.save();
  
    return res.status(200).json(
      new ApiResponse(
        200,
        document,
        "Document updated successfully"
      )
    );
  });

   const getDocumentLLMText = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      throw new ApiError(400, "Invalid document ID");
    }
  
    const document = await Document.findById(documentId).select("llmText processingStatus title");
  
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
  
    if (document.processingStatus !== "processed") {
      throw new ApiError(400, "Document is not processed yet");
    }
  
    return res.status(200).json(
      new ApiResponse(200, { llmText: document.llmText || "" }, "LLM text fetched")
    );
  });
  
  

export { uploadDocument, getAllNotes, getDocumentById ,deleteDocument,getAllPYQs,searchDocuments,updateDocument, getDocumentLLMText };
