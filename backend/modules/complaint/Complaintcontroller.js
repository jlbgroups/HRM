const Complaint = require("../../models/Complaint");
const Employee = require("../../models/Employee");

exports.raiseComplaint = async (req, res) => {
  try {
    const { against_employee_id, subject, description, priority } = req.body;

    if (!against_employee_id || !subject || !description) {
      return res.status(400).json({ success: false, error: "Target employee, subject and description are required." });
    }

    const raisedByEmployee = await Employee.findOne({ user_id: req.user.id });
    if (!raisedByEmployee) {
      return res.status(404).json({ success: false, error: "Your employee profile not found." });
    }

    if (raisedByEmployee._id.toString() === against_employee_id) {
      return res.status(400).json({ success: false, error: "You cannot raise a complaint against yourself." });
    }

    const targetEmployee = await Employee.findOne({
      _id: against_employee_id,
      company_id: raisedByEmployee.company_id,
    });

    if (!targetEmployee) {
      return res.status(404).json({ success: false, error: "Target employee not found in your company." });
    }

    const complaint = await Complaint.create({
      raised_by: raisedByEmployee._id,
      against: targetEmployee._id,
      company_id: raisedByEmployee.company_id,
      subject,
      description,
      priority: priority || "medium",
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    console.error("raiseComplaint Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    const raisedByMe = await Complaint.find({ raised_by: employee._id })
      .populate({ path: "against", populate: { path: "user_id", select: "name email avatar_url" } })
      .populate("resolved_by", "name email")
      .sort({ createdAt: -1 });

    const raisedAgainstMe = await Complaint.find({ against: employee._id })
      .populate({ path: "raised_by", populate: { path: "user_id", select: "name email avatar_url" } })
      .populate("resolved_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { raisedByMe, raisedAgainstMe } });
  } catch (err) {
    console.error("getMyComplaints Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const complaints = await Complaint.find({ company_id: companyId })
      .populate({ path: "raised_by", populate: { path: "user_id", select: "name email avatar_url" } })
      .populate({ path: "against", populate: { path: "user_id", select: "name email avatar_url" } })
      .populate("resolved_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error("getAllComplaints Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { status, resolution_note } = req.body;

    if (!["under_review", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status." });
    }

    const complaint = await Complaint.findOne({ _id: req.params.id, company_id: companyId });
    if (!complaint) {
      return res.status(404).json({ success: false, error: "Complaint not found." });
    }

    complaint.status = status;
    complaint.resolution_note = resolution_note || "";
    if (status === "resolved" || status === "dismissed") {
      complaint.resolved_by = req.user.id;
      complaint.resolved_at = new Date();
    }
    await complaint.save();

    res.json({ success: true, data: complaint });
  } catch (err) {
    console.error("resolveComplaint Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};