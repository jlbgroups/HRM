const mongoose = require("mongoose");

const letterSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      trim: true,
    },
    employeeName: {
      type: String,
      default: "",
      trim: true,
    },
    employeeEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    letterType: {
      type: String,
      required: true,
      enum: ["offer", "experience", "salary", "relieving", "custom"],
      default: "offer",
    },
    htmlContent: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    customTitle: {
      type: String,
      default: "",
      trim: true,
    },
    customSubject: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["sent", "draft"],
      default: "draft",
    },
    sent_at: {
      type: Date,
      default: null,
    },
    updated_at: {
      type: Date,
      default: null,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("Letter", letterSchema);