const Resignation = require("../../models/Resignation");
const Employee = require("../../models/Employee");

exports.submitResignation = async (req, res) => {
  try {
    const { last_working_day, reason, notice_date } = req.body;

    if (!last_working_day || !reason) {
      return res.status(400).json({ success: false, error: "Last working day and reason are required." });
    }

    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    const existing = await Resignation.findOne({
      employee_id: employee._id,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return res.status(400).json({ success: false, error: "You already have an active resignation request." });
    }

    const resignation = await Resignation.create({
      employee_id: employee._id,
      company_id: employee.company_id,
      last_working_day: new Date(last_working_day),
      notice_date: notice_date ? new Date(notice_date) : new Date(),
      reason,
    });

    res.status(201).json({ success: true, data: resignation });
  } catch (err) {
    console.error("submitResignation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyResignation = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    const resignations = await Resignation.find({ employee_id: employee._id })
      .populate("reviewed_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: resignations });
  } catch (err) {
    console.error("getMyResignation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.withdrawResignation = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    const resignation = await Resignation.findOne({
      _id: req.params.id,
      employee_id: employee._id,
      status: "pending",
    });

    if (!resignation) {
      return res.status(404).json({ success: false, error: "Pending resignation not found." });
    }

    resignation.status = "withdrawn";
    await resignation.save();

    res.json({ success: true, data: resignation });
  } catch (err) {
    console.error("withdrawResignation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllResignations = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const resignations = await Resignation.find({ company_id: companyId })
      .populate({
        path: "employee_id",
        populate: { path: "user_id", select: "name email avatar_url" },
      })
      .populate("reviewed_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: resignations });
  } catch (err) {
    console.error("getAllResignations Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reviewResignation = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { status, admin_note } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, error: "Status must be approved or rejected." });
    }

    const resignation = await Resignation.findOne({ _id: req.params.id, company_id: companyId });
    if (!resignation) {
      return res.status(404).json({ success: false, error: "Resignation not found." });
    }

    if (resignation.status !== "pending") {
      return res.status(400).json({ success: false, error: "Only pending resignations can be reviewed." });
    }

    resignation.status = status;
    resignation.reviewed_by = req.user.id;
    resignation.reviewed_at = new Date();
    resignation.admin_note = admin_note || "";
    await resignation.save();

    res.json({ success: true, data: resignation });
  } catch (err) {
    console.error("reviewResignation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};