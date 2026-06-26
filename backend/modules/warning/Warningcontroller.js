const Warning = require("../../models/Warning");
const Employee = require("../../models/Employee");
const { createNotification, getCompanyAdmins } = require("../notifications/notificationHelper");

exports.createWarning = async (req, res) => {
  try {
    const { employee_id, subject, description, severity, warning_date } = req.body;
    const companyId = req.user.company_id;

    if (!employee_id || !subject || !description) {
      return res.status(400).json({ success: false, error: "Employee, subject and description are required." });
    }

    const employee = await Employee.findOne({ _id: employee_id, company_id: companyId });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee not found in your company." });
    }

    const warning = await Warning.create({
      employee_id,
      issued_by: req.user.id,
      company_id: companyId,
      subject,
      description,
      severity: severity || "medium",
      warning_date: warning_date ? new Date(warning_date) : new Date(),
    });

    // Notify the employee
    try {
      if (employee.user_id) {
        await createNotification(
          employee.user_id,
          "warning",
          `⚠️ You have received a warning: "${subject}". Please check your warnings section.`
        );
      }
    } catch (_) {}

    res.status(201).json({ success: true, data: warning });
  } catch (err) {
    console.error("createWarning Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getWarnings = async (req, res) => {
  try {
    const companyId = req.user.company_id;

    const warnings = await Warning.find({ company_id: companyId })
      .populate({
        path: "employee_id",
        select: "name email",
        populate: { path: "user_id", select: "name email avatar_url" },
      })
      .populate("issued_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: warnings });
  } catch (err) {
    console.error("getWarnings Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyWarnings = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    const warnings = await Warning.find({ employee_id: employee._id })
      .populate("issued_by", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: warnings });
  } catch (err) {
    console.error("getMyWarnings Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.acknowledgeWarning = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: "Employee profile not found." });
    }

    const warning = await Warning.findOne({ _id: req.params.id, employee_id: employee._id });
    if (!warning) {
      return res.status(404).json({ success: false, error: "Warning not found." });
    }

    warning.status = "acknowledged";
    warning.acknowledged_at = new Date();
    await warning.save();

    // Notify admin when employee acknowledges warning
    try {
      const adminIds = await getCompanyAdmins(employee.company_id);
      for (const adminId of adminIds) {
        await createNotification(
          adminId,
          "warning",
          `✅ ${employee.name} has acknowledged the warning: "${warning.subject}".`
        );
      }
    } catch (_) {}

    res.json({ success: true, data: warning });
  } catch (err) {
    console.error("acknowledgeWarning Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteWarning = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const warning = await Warning.findOneAndDelete({ _id: req.params.id, company_id: companyId });

    if (!warning) {
      return res.status(404).json({ success: false, error: "Warning not found." });
    }

    res.json({ success: true, msg: "Warning deleted." });
  } catch (err) {
    console.error("deleteWarning Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateWarningStatus = async (req, res) => {
  try {
    const companyId = req.user.company_id;
    const { status } = req.body;

    const warning = await Warning.findOneAndUpdate(
      { _id: req.params.id, company_id: companyId },
      { status },
      { new: true }
    );

    if (!warning) {
      return res.status(404).json({ success: false, error: "Warning not found." });
    }

    res.json({ success: true, data: warning });
  } catch (err) {
    console.error("updateWarningStatus Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};