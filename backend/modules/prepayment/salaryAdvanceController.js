const SalaryAdvance = require("../../models/SalaryAdvance");
const Employee = require("../../models/Employee");

exports.getAllAdvances = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const advances = await SalaryAdvance.find({ company_id: companyId })
      .populate({
        path: "employee_id",
        select: "name email salary designation company_id",
        populate: {
          path: "company_id",
          select: "company_name"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: advances });
  } catch (err) {
    console.error("Error in getAllAdvances:", err);
    res.status(500).json({ error: "Failed to fetch advances", details: err.message });
  }
};

exports.getAdvancesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const companyId = req.user.company_id;

    const advances = await SalaryAdvance.find({ status, company_id: companyId })
      .populate({
        path: "employee_id",
        select: "name email salary designation company_id",
        populate: {
          path: "company_id",
          select: "company_name"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: advances });
  } catch (err) {
    console.error("Error in getAdvancesByStatus:", err);
    res.status(500).json({ error: "Failed to fetch advances" });
  }
};

exports.requestAdvance = async (req, res) => {
  try {
    const { employee_id, amount, reason, repayment_months, notes } = req.body;

    const pendingRequest = await SalaryAdvance.findOne({
      employee_id,
      status: "pending"
    });

    if (pendingRequest) {
      return res.status(400).json({ error: "You already have a pending request" });
    }

    const employee = await Employee.findById(employee_id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const maxAdvance = employee.salary * 0.5;
    if (amount > maxAdvance) {
      return res.status(400).json({
        error: `Maximum advance amount is 50% of salary (₹${maxAdvance.toLocaleString()})`
      });
    }

    const monthlyDeduction = amount / (repayment_months || 3);

    const advance = new SalaryAdvance({
      employee_id,
      company_id: employee.company_id,
      amount,
      reason,
      repayment_months: repayment_months || 3,
      monthly_deduction: monthlyDeduction,
      remaining_amount: amount,
      notes
    });

    await advance.save();

    res.status(201).json({ success: true, data: advance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAdvances = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({ user_id: userId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const advances = await SalaryAdvance.find({
      employee_id: employee._id
    }).sort({ requested_date: -1 });

    res.json({ success: true, data: advances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch advances" });
  }
};

exports.updateAdvanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (status === "approved" && advance.status !== "approved") {
      const employee = await Employee.findById(advance.employee_id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const newSalary = employee.salary - advance.amount;
      if (newSalary < 0) {
        return res.status(400).json({ error: "Salary cannot be negative after deduction" });
      }

      employee.salary = newSalary;
      await employee.save();

      advance.status = status;
      advance.approved_date = new Date();
    } else if (status === "rejected") {
      advance.status = status;
      advance.rejected_date = new Date();
    } else if (status === "approved") {
      advance.approved_date = new Date();
    } else {
      advance.status = status;
    }

    await advance.save();

    res.json({ success: true, data: advance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

exports.deleteAdvance = async (req, res) => {
  try {
    const { id } = req.params;

    const advance = await SalaryAdvance.findById(id);
    if (!advance) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (advance.status === "approved") {
      return res.status(400).json({ error: "Cannot delete approved advance request" });
    }

    await SalaryAdvance.findByIdAndDelete(id);

    res.json({ success: true, message: "Request deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete" });
  }
};