const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },
    
    email: {
      type: String,
      required: true,
    },
    
    phone: {
      type: String,
      default: "",
    },

    position: {
      type: String,
      enum: ["employee", "manager"],
      default: "employee",
    },

    department_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false, 
    },

    designation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation",
    },

    designation: {
      type: String,
      default: null,
    },

    manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    joining_date: {
      type: Date,
      default: Date.now,
    },

    salary: {
      type: Number,
      default: 0,
      min: 0,
      get: v => v || 0, 
      set: v => v === null || v === undefined || v === '' ? 0 : Number(v) 
    },

    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },
  },
  { 
    timestamps: true,
    toJSON: { getters: true }, 
    toObject: { getters: true }
  }
);

module.exports = mongoose.model("Employee", employeeSchema);