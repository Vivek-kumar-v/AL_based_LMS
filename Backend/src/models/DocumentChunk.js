import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true,
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    },

    chunkIndex: {
        type: Number,
        required: true,
    },

    text: {
        type: String,
        required: true,
    },

    embedding: {
        type: [Number],
        required: true,
    },

    pageNumber: {
        type: Number,
        default: null,
    }
});

// Indexes
documentChunkSchema.index({ documentId: 1 });
documentChunkSchema.index({ uploadedBy: 1 });
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

export const DocumentChunk = mongoose.model(
  "DocumentChunk",
  documentChunkSchema
);