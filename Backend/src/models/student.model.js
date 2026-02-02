import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const studentSchema = new Schema(
  {
    // =========================
    // AUTH & IDENTITY
    // =========================
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    avatar: {
      type: String, // cloudinary url
      required: true,
    },

    password: {
      type: String,
      required: [true,"Password is required"],
    },

    refreshToken: {
      type: String,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    // =========================
    // ACADEMIC PROFILE
    // =========================
    collegeName: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    semester: {
      type: Number,
    },

    subjects: [
      {
        type: String,
      },
    ],

    // =========================
    // LEARNING PREFERENCES
    // =========================
    preferences: {
      explanationStyle: {
        type: String,
        enum: ["simple", "detailed", "exam-oriented"],
        default: "exam-oriented",
      },

      revisionFrequency: {
        type: String,
        enum: ["daily", "weekly", "custom"],
        default: "weekly",
      },
    },

    // =========================
    // CONCEPT INTELLIGENCE
    // =========================
    conceptStats: [
      {
        conceptId: {
          type: Schema.Types.ObjectId,
          ref: "Concept",
        },
        strengthScore: {
          type: Number, // 0–100
          default: 0,
        },
        lastRevisedAt: {
          type: Date,
        },
        revisionCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // =========================
    // PYQ INTERACTION
    // =========================
    pyqActivity: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "PYQ",
        },
        attempted: {
          type: Boolean,
          default: false,
        },
        confidenceLevel: {
          type: Number, // 1–5
        },
      },
    ],

    // =========================
    // REVISION & ANALYTICS
    // =========================
    revisionHistory: [
      {
        conceptId: {
          type: Schema.Types.ObjectId,
          ref: "Concept",
        },
        revisedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    activityStats: {
      searches: {
        type: Number,
        default: 0,
      },
      uploads: {
        type: Number,
        default: 0,
      },
      aiQueries: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);




studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  studentSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
  };
  


  studentSchema.methods.generateAccessToken = function () {
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        role: this.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
  };
  
  studentSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      { _id: this._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
  };
  

  export const Student = mongoose.model("Student", studentSchema);
