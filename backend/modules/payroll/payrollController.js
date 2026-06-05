const Payroll = require("../../models/Payroll");
const Employee = require("../../models/Employee");
const Company = require("../../models/Company");
const Department = require("../../models/Department");
const SalaryAdvance = require("../../models/SalaryAdvance");

const { sendPayslipEmail } = require("../../utils/emailHelper");

exports.getPayrollList = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ company_id: companyId })
      .populate("department_id", "department_name")
      .sort({ name: 1 });

    const data = [];

    for (let emp of employees) {
      const latestPayroll = await Payroll.findOne({ employee_id: emp._id })
        .sort({ pay_date: -1 });

      let payment_status = "Unpaid";

      if (latestPayroll && latestPayroll.pay_date) {
        const now = new Date();
        const payDate = new Date(latestPayroll.pay_date);

        if (
          payDate.getMonth() === now.getMonth() &&
          payDate.getFullYear() === now.getFullYear()
        ) {
          payment_status = "Paid";
        }
      }

      data.push({
        payroll_id: latestPayroll?._id || null,
        employee_id: emp._id,
        name: emp.name,
        email: emp.email,
        department_name: emp.department_id?.department_name || null,

        salary: latestPayroll?.salary || 0,
        bonus: latestPayroll?.bonus || 0,
        allowances: latestPayroll?.allowances || 0,
        deductions: latestPayroll?.deductions || 0,
        tax: 0,
        pf: 0,
        pt: 0,
        esi: 0,
        advance_deduction: latestPayroll?.advance_deduction || 0,
        total_deductions: latestPayroll?.total_deductions || 0,
        last_net_salary: latestPayroll?.net_salary || 0,

        pay_date: latestPayroll?.pay_date || null,
        pay_period: latestPayroll?.pay_period || null,
        notes: latestPayroll?.notes || null,

        payment_status,
      });
    }

    res.json({ success: true, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load payroll list" });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const {
      employee_id,
      pay_date,
      pay_period,
      salary,
      bonus,
      bonus_reason,
      allowances,
      allowance_reason,
      deductions,
      deduction_reason,
      notes,
    } = req.body;

    const activeAdvances = await SalaryAdvance.find({
      employee_id: employee_id,
      status: "approved",
      remaining_amount: { $gt: 0 }
    });

    const totalAdvanceDeduction = activeAdvances.reduce(
      (sum, advance) => sum + (advance.monthly_deduction || 0),
      0
    );

    for (const advance of activeAdvances) {
      const newRemaining = advance.remaining_amount - (advance.monthly_deduction || 0);
      advance.remaining_amount = Math.max(0, newRemaining);
      await advance.save();
    }

    const base = parseFloat(salary || 0);
    const bonusAmt = parseFloat(bonus || 0);
    const allowanceAmt = parseFloat(allowances || 0);
    const customDeductionAmt = parseFloat(deductions || 0);

    const grossSalary = base + bonusAmt + allowanceAmt;
    const totalDeductions = customDeductionAmt + totalAdvanceDeduction;
    const netSalary = grossSalary - totalDeductions;

    const payroll = await Payroll.create({
      employee_id,
      salary: base,
      bonus: bonusAmt,
      bonus_reason,
      allowances: allowanceAmt,
      allowance_reason,
      deductions: customDeductionAmt,
      deduction_reason,
      pf: 0,
      pt: 0,
      tax: 0,
      esi: 0,
      advance_deduction: totalAdvanceDeduction,
      total_deductions: totalDeductions,
      net_salary: netSalary,
      pay_date: pay_date || new Date(),
      pay_period,
      notes,
    });

    const emp = await Employee.findById(employee_id);
    const company = await Company.findById(emp.company_id);

    if (emp && company) {
      sendPayslipEmail({
        name: emp.name,
        email: emp.email,
        companyName: company.company_name,
        employeeId: emp._id,
        payrollId: payroll._id,
        baseSalary: base,
        bonus: bonusAmt,
        bonusReason: bonus_reason,
        allowances: allowanceAmt,
        allowanceReason: allowance_reason,
        pf: 0,
        pt: 0,
        tds: 0,
        esi: 0,
        customDeductions: customDeductionAmt,
        customDeductionReason: deduction_reason,
        advanceDeduction: totalAdvanceDeduction,
        totalDeductions: totalDeductions,
        grossSalary: grossSalary,
        netSalary,
        payDate: payroll.pay_date,
        payPeriod: pay_period || "",
        notes: notes || "",
      }).catch(err =>
        console.error("Payslip email failed:", err.message)
      );
    }

    res.json({
      success: true,
      msg: "Payment processed successfully",
      data: {
        ...payroll._doc,
        gross_salary: grossSalary,
        statutory_deductions: 0,
        pf: 0,
        pt: 0,
        tds: 0,
        esi: 0,
      },
    });

  } catch (err) {
    console.error("Process Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await Employee.findOne({ user_id: userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    const payslips = await Payroll.find({
      employee_id: employee._id,
    })
      .sort({ pay_date: -1 })
      .populate({
        path: "employee_id",
        populate: { path: "department_id" }
      });

    res.json({
      success: true,
      data: payslips,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load payslips",
    });
  }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id)
      .populate({
        path: "employee_id",
        populate: { path: "department_id" },
      });

    if (!payroll) {
      return res.status(404).json({
        error: "Payslip not found",
      });
    }

    res.json({
      success: true,
      data: payroll,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Error fetching payslip",
    });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const payroll = await Payroll.findById(id).populate("employee_id");

    if (
      !payroll ||
      payroll.employee_id.company_id.toString() !== companyId.toString()
    ) {
      return res.status(404).json({
        error: "Record not found",
      });
    }

    await Payroll.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Payroll record deleted",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Delete failed",
    });
  }
};

exports.getAllPayrollHistory = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const employees = await Employee.find({ company_id: companyId }).select("_id");
    const empIds = employees.map(e => e._id);

    const history = await Payroll.find({
      employee_id: { $in: empIds },
    })
      .sort({ pay_date: -1 })
      .populate("employee_id");

    const result = history.map(p => ({
      ...p._doc,
      payment_status: "Paid",
    }));

    res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load history",
    });
  }
};

exports.getAdvanceDeductions = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const companyId = req.user.company_id;

    const employee = await Employee.findOne({
      _id: employee_id,
      company_id: companyId
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const activeAdvances = await SalaryAdvance.find({
      employee_id: employee_id,
      status: "approved",
      remaining_amount: { $gt: 0 }
    });

    res.json({
      success: true,
      data: activeAdvances,
      total_deduction: activeAdvances.reduce((sum, a) => sum + (a.monthly_deduction || 0), 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch advance deductions" });
  }
};