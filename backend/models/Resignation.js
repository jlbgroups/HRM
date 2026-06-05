const mongoose = require("mongoose");

const resignationSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    notice_date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    last_working_day: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
    },
    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewed_at: {
      type: Date,
    },
    admin_note: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resignation", resignationSchema);