import mongoose, { Schema } from "mongoose";

const conceptSchema = new Schema(
  {
    // =========================
    // BASIC CONCEPT INFO
    // =========================
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // =========================
    // RELATIONSHIPS
    // =========================
    relatedConcepts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Concept",
      },
    ],

    // =========================
    // ANALYTICS (FOR AI / EXAMS)
    // =========================
    importanceScore: {
      type: Number,
      default: 0, // increases based on PYQ frequency
    },

    frequencyInPYQ: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================
conceptSchema.index({ name: "text", subject: "text" });

export const Concept = mongoose.model("Concept", conceptSchema);
