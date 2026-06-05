const mongoose = require("mongoose");

const salaryAdvanceSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  requested_date: {
    type: Date,
    default: Date.now
  },
  approved_date: Date,
  rejected_date: Date,
  repayment_months: {
    type: Number,
    default: 3
  },
  monthly_deduction: Number,
  remaining_amount: Number,
  notes: String,
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  deducted_amount: {
    type: Number,
    default: 0
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("SalaryAdvance", salaryAdvanceSchema);