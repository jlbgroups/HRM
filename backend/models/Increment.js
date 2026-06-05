const mongoose = require("mongoose");

const incrementSchema = new mongoose.Schema({
  employee_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  type: {
    type: String,
    enum: ["increment", "promotion"],
    required: true
  },
  old_salary: Number,
  new_salary: Number,
  old_designation: String,
  new_designation: String,
  effective_date: {
    type: Date,
    required: true
  },
  remarks: String,
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Increment", incrementSchema);