import mongoose, { Schema } from "mongoose";

const conceptSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    relatedConcepts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Concept",
      },
    ],

    importanceScore: {
      type: Number,
      default: 0,
    },

    frequencyInPYQ: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

conceptSchema.index({ normalizedName: 1, subject: 1 }, { unique: true });

conceptSchema.index({ displayName: "text", subject: "text" });

export const Concept = mongoose.model("Concept", conceptSchema);
