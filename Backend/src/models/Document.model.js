import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema(
  {
    // BASIC METADATA
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    documentType: {
      type: String,
      enum: ["notes", "pyq"],
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      index: true,
    },

    semester: {
      type: Number,
      index: true,
    },

    year: {
      type: Number, // mainly for PYQs
    },

    // FILE STORAGE
    fileUrl: {
      type: String, // cloudinary / s3 url
      required: true,
    },

    fileType: {
      type: String, // pdf, jpg, png
      required: true,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    // TEXT PROCESSING
    rawText: {
      type: String,
      select: false, // large field
    },

    cleanedText: {
      type: String,
      select: false,
    },

    // AI PROCESSING STATUS
    processingStatus: {
      type: String,
      enum: ["pending", "processed", "failed"],
      default: "pending",
    },

    processedAt: {
      type: Date,
    },

    // CONCEPT LINKING
    extractedConcepts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Concept",
      },
    ],

    // PYQ SPECIFIC FIELDS
    totalQuestions: {
      type: Number,
    },

    totalMarks: {
      type: Number,
    },

    // VISIBILITY & MODERATION
    isPublic: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES (PERFORMANCE)
documentSchema.index({ title: "text", subject: "text" });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ documentType: 1 });

export const Document = mongoose.model("Document", documentSchema);
