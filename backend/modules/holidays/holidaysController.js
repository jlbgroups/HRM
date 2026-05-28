const Holiday  = require("../../models/Holiday");
const Employee = require("../../models/Employee"); 
const { sendHolidayNotificationEmail } = require("../../utils/emailHelper"); 
const getEmployeeEmails = async (company_id) => {
  console.log(company_id)
  const employees = await Employee.find(
    { company_id },
    "email"
  );
  return employees.map((e) => e.email).filter(Boolean);
};

const notifyEmployees = async (company_id, action, holiday) => {
  try {
    const emails = await getEmployeeEmails(company_id);

    if (!emails.length) {
      console.log(" No employees found for email notification");
      return;
    }

    console.log("Sending emails to:", emails);

    const result = await sendHolidayNotificationEmail({
      emails,
      action,
      holiday,
    });

    console.log(" Email result:", result);
  } catch (err) {
    console.error("Holiday mail error:", err.message);
  }
};

exports.getHolidays = async (req, res) => {
  const company_id = req.user.company_id;
  try {
    const holidays = await Holiday.find({ company_id }).sort({ holiday_date: 1 });
    res.status(200).json({ success: true, data: holidays });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error fetching holidays" });
  }
};


exports.addHoliday = async (req, res) => {
  const { holiday_date, description } = req.body;
  const company_id = req.user.company_id;
  try {
    const holiday = await Holiday.create({ holiday_date, description, company_id });
    notifyEmployees(company_id, "added", holiday);
    res.status(201).json({ success: true, data: holiday });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error adding holiday" });
  }
};


exports.updateHoliday = async (req, res) => {
  console.log(req)
  const { id } = req.params;
  const { holiday_date, description } = req.body;
  const company_id = req.user.company_id;
  try {
    const holiday = await Holiday.findOneAndUpdate(
      { _id: id, company_id },
      { holiday_date, description },
      { new: true }
    );
    if (!holiday) return res.status(404).json({ error: "Holiday not found" });
    console.log( company_id)
    notifyEmployees(company_id, "updated", holiday);
    res.status(200).json({ success: true, data: holiday });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error updating holiday" });
  }
};


exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;
  const company_id = req.user.company_id;
  try {
    const holiday = await Holiday.findOneAndDelete({ _id: id, company_id });
    if (!holiday) return res.status(404).json({ error: "Holiday not found" });
    notifyEmployees(company_id, "deleted", holiday);
    res.status(200).json({ success: true, message: "Holiday deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Error deleting holiday" });
  }
};