const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const FRONTEND = process.env.FRONTEND_URL || "http://localhost:3000";
const sendWelcomeEmail = async ({ name, email, password, role }) => {
  const roleLabels = {
    employee: "Employee",
    company_admin: "Company Administrator",
    super_admin: "Super Administrator",
    software_owner: "Software Owner",
  };
  const roleLabel = roleLabels[role] || role;

  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <h2>Welcome to Shnoor</h2>
        <p>${roleLabel} Account Created</p>
      </div>
      <div style="padding:25px">
        <p>Hello <b>${name}</b>,</p>
        <p>Your account is ready. Use below credentials:</p>
        <div style="background:#f8fafc;padding:15px;border-radius:10px">
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p><b>Role:</b> ${roleLabel}</p>
        </div>
        <a href="${FRONTEND}/login"
          style="display:block;margin:20px auto;padding:12px 25px;background:#4f46e5;color:#fff;text-align:center;text-decoration:none;border-radius:8px">
          Login Now
        </a>
        <p style="color:#b91c1c;font-size:13px">Change your password after first login.</p>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"Shnoor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to Shnoor - ${roleLabel}`,
    html,
  });
};


const sendTrialEmail = async ({ name, email, companyName, trialEnd }) => {
  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <h2>Trial Started 🎉</h2>
        <p>${companyName}</p>
      </div>
      <div style="padding:25px">
        <p>Hello <b>${name}</b></p>
        <p>Your 15-day trial started successfully.</p>
        <div style="background:#eef2ff;padding:15px;border-radius:10px;text-align:center">
          <h1>15 Days</h1>
          <p>Ends on ${formatDate(trialEnd)}</p>
        </div>
        <a href="${FRONTEND}/login"
          style="display:block;margin:20px auto;padding:12px 25px;background:#4f46e5;color:#fff;text-align:center;text-decoration:none;border-radius:8px">
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"Shnoor" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Trial Activated - ${companyName}`,
    html,
  });
};


const sendPayslipEmail = async (data) => {
  const {
    name, email, companyName, employeeId,
    baseSalary, bonus = 0, bonusReason,
    allowances = 0, allowanceReason,
    deductions = 0, deductionReason,
    tax = 0, taxReason,
    netSalary, payDate, payPeriod, notes,
  } = data;

  const rupee = (n) =>
    "₹" + parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const html = `
  <div style="max-width:600px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#d4a017,#f5c332);padding:25px;text-align:center;color:#fff">
        <h2>Payslip</h2>
        <p>${companyName}</p>
      </div>
      <div style="padding:25px">
        <p>Hello <b>${name}</b></p>
        <div style="background:#fff7ed;padding:15px;border-radius:10px;text-align:center">
          <h2>${rupee(netSalary)}</h2>
          <p>Net Salary</p>
        </div>
        <p><b>Employee ID:</b> EMP-${employeeId}</p>
        <p><b>Date:</b> ${formatDate(payDate)}</p>
        <h4>Earnings</h4>
        <p>Basic: ${rupee(baseSalary)}</p>
        ${bonus ? `<p>Bonus: ${rupee(bonus)} (${bonusReason || ""})</p>` : ""}
        ${allowances ? `<p>Allowance: ${rupee(allowances)}</p>` : ""}
        <h4>Deductions</h4>
        ${deductions ? `<p>Deductions: ${rupee(deductions)}</p>` : ""}
        ${tax ? `<p>Tax: ${rupee(tax)}</p>` : ""}
        ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ""}
        <a href="${FRONTEND}/employee/payroll"
          style="display:block;margin-top:20px;text-align:center;background:#d4a017;color:#fff;padding:12px;border-radius:8px;text-decoration:none">
          View Payslip
        </a>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payslip - ${formatDate(payDate)}`,
    html,
  });
};


const sendHolidayNotificationEmail = async ({ emails, action, holiday }) => {
  if (!emails || emails.length === 0) return;

  const formattedDate = new Date(holiday.holiday_date).toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const config = {
    added:   { emoji: "🎉", label: "New Holiday Added",  color: "#059669", bg: "#ecfdf5" },
    updated: { emoji: "✏️",  label: "Holiday Updated",    color: "#D97706", bg: "#fffbeb" },
    deleted: { emoji: "❌", label: "Holiday Cancelled",  color: "#DC2626", bg: "#fef2f2" },
  };
  const { emoji, label, color, bg } = config[action] || config.added;

  const subjects = {
    added:   `🎉 New Holiday: ${holiday.description} on ${formattedDate}`,
    updated: `✏️ Holiday Updated: ${holiday.description} — ${formattedDate}`,
    deleted: `❌ Holiday Cancelled: ${holiday.description}`,
  };

  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI,Arial,sans-serif;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07)">

      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <div style="font-size:2.2rem;margin-bottom:8px">${emoji}</div>
        <h2 style="margin:0;font-size:1.2rem">${label}</h2>
        <p style="margin:6px 0 0;opacity:0.85;font-size:0.875rem">SHNOOR INTERNATIONAL LLC</p>
      </div>

      <div style="padding:28px">
        <p style="color:#374151;margin:0 0 18px">Please note the following holiday update:</p>

        <div style="background:${bg};border-left:4px solid ${color};border-radius:8px;padding:16px 20px;margin-bottom:20px">
          <div style="margin-bottom:10px">
            <span style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF">Holiday Name</span>
            <div style="font-size:1.05rem;font-weight:700;color:#111827;margin-top:3px">${holiday.description}</div>
          </div>
          <div>
            <span style="font-size:0.72rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#9CA3AF">Date</span>
            <div style="font-size:0.9rem;color:#374151;margin-top:3px">${formattedDate}</div>
          </div>
        </div>

        <span style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:0.78rem;font-weight:600;color:#fff;background:${color}">
          ${label.toUpperCase()}
        </span>

        <div style="margin-top:22px;padding-top:16px;border-top:1px solid #f1f3f9">
          <p style="color:#9CA3AF;font-size:0.8rem;margin:0">
            Please update your schedule accordingly. Contact HR for any queries.
          </p>
        </div>
      </div>

    </div>
    <p style="text-align:center;color:#9CA3AF;font-size:0.75rem;margin-top:14px">
      This is an automated notification from your HRM Portal. Do not reply to this email.
    </p>
  </div>`;

  return transporter.sendMail({
    from: process.env.MAIL_FROM || `"Shnoor HRM" <${process.env.EMAIL_USER}>`,
    to: emails.join(","),
    subject: subjects[action] || subjects.added,
    html,
  });
};


module.exports = {
  sendWelcomeEmail,
  sendTrialEmail,
  sendPayslipEmail,
  sendHolidayNotificationEmail,
};