const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const LeaveBalance = require("../../models/LeaveBalance");
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, company_id, company_name, department_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ msg: "Name, email, password and role are required." });
    }

    if (role === "super_admin" || role === "software_owner") {
      const token = req.header("x-auth-token");
      if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "super_admin" && decoded.role !== "software_owner") {
          return res.status(403).json({ msg: "Not authorized to create admin accounts." });
        }
      } catch (err) {
        return res.status(401).json({ msg: "Token is not valid" });
      }
    }

    const emailLower = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists with this email." });
    }

    let finalCompanyId = company_id || null;
    let trialEnd = null;

    if (role === "company_admin") {
      if (!company_name || !company_name.trim()) {
        return res.status(400).json({ msg: "Company name is required for Company Administrator." });
      }
      const Company = require("../../models/Company");
      const newCompany = await Company.create({
        company_name: company_name.trim(),
        is_trial: true,
        is_active: true,
        trial_start: new Date(),
        trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      });
      finalCompanyId = newCompany._id;
      trialEnd = newCompany.trial_end;
    } else if (role === "employee") {
      if (!company_id) {
        return res.status(400).json({ msg: "Company ID is required for Employee." });
      }
      const Company = require("../../models/Company");
      const companyExists = await Company.findById(company_id);
      if (!companyExists) {
        return res.status(400).json({ msg: "Invalid Company ID. Company not found." });
      }
      if (!companyExists.is_active) {
        return res.status(403).json({ msg: "Company is inactive. Please contact your administrator." });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: emailLower,
      password: hashedPassword,
      role,
      company_id: finalCompanyId,
    });

    if (role === "employee" || role === "company_admin") {
      const defaultDept = "6a0451f0ba0cbcdb3965477b";

      const emp = await Employee.create({
        user_id: newUser._id,
        name,
        email: emailLower,
        company_id: finalCompanyId,
        department_id: department_id || defaultDept,
        joining_date: new Date(),
      });
      if (role === "employee") {
        await LeaveBalance.create({
          employee_id: emp._id,
          leave_type: "Annual",
          total_leaves: 20,
          remaining_leaves: 20,
          company_id: finalCompanyId,
        });
      }
    }

    // Try sending email
    try {
      const { sendWelcomeEmail, sendTrialEmail } = require("../../utils/emailHelper");
      
      sendWelcomeEmail({
        name,
        email: emailLower,
        password,
        role,
        companyName: company_name ? company_name.trim() : "",
      }).catch((err) => console.error("Welcome email failed:", err.message));

      if (role === "company_admin" && trialEnd) {
        sendTrialEmail({
          name,
          email: emailLower,
          companyName: company_name.trim(),
          trialEnd,
        }).catch((err) => console.error("Trial email failed:", err.message));
      }
    } catch (e) {
      console.error("Email setup failed:", e.message);
    }

    res.status(201).json({
      success: true,
      msg: "Registration successful.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const emailLower = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been suspended by the administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    let employee_id = null;
    let position = null;

    if (user.role === "employee" || user.role === "company_admin") {
      const empRecord = await Employee.findOne({ user_id: user._id });
      if (empRecord) {
        employee_id = empRecord._id;
        position = empRecord.position;
      }
    }

    let trialPayload = null;

    if (user.role === "company_admin" || user.role === "employee") {
      if (user.company_id) {
        const Company = require("../../models/Company");
        const company = await Company.findById(user.company_id);
        if (company) {
          if (!company.is_active) {
            return res.status(403).json({
              success: false,
              msg: "Your company account has been suspended.",
            });
          }
          const now = new Date();
          const diff = company.trial_end - now;
          const daysLeft = Math.max(
            0,
            Math.ceil(diff / (1000 * 60 * 60 * 24))
          );
          trialPayload = {
            is_trial: company.is_trial,
            trial_start: company.trial_start,
            trial_end: company.trial_end,
            days_left: daysLeft,
            is_expired: company.is_trial && (new Date(company.trial_end) < now),
          };
        }
      }
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        company_id: user.company_id,
        employee_id,
        position,
      },
      trial: trialPayload,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  }
};