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
        <h2>Welcome to Levroxen</h2>
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
    from: `"Levroxen" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to Levroxen - ${roleLabel}`,
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
    from: `"Levroxen" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Trial Activated - ${companyName}`,
    html,
  });
};

const sendPayslipEmail = async (data) => {
  const {
    name, 
    email, 
    companyName, 
    employeeId,
    payrollId,
    baseSalary, 
    bonus = 0, 
    bonusReason,
    allowances = 0, 
    allowanceReason,
    deductions = 0, 
    deductionReason,
    tax = 0, 
    taxReason,
    advanceDeduction = 0,
    netSalary, 
    payDate, 
    payPeriod, 
    notes,
  } = data;

  const rupee = (n) =>
    "₹" + parseFloat(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const html = `
  <div style="max-width:600px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.07)">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <h2 style="margin:0 0 5px">Payslip</h2>
        <p style="margin:0;opacity:0.9">${companyName}</p>
        <p style="margin:5px 0 0;font-size:12px;opacity:0.8">${payPeriod || formatDate(payDate)}</p>
      </div>
      
      <div style="padding:25px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <div>
            <p style="margin:0 0 5px"><b>${name}</b></p>
            <p style="margin:0;font-size:12px;color:#6B7280">Employee ID: EMP-${employeeId}</p>
          </div>
          <div style="background:#EEF2FF;padding:12px 18px;border-radius:10px;text-align:center">
            <p style="margin:0 0 3px;font-size:11px;color:#4F46E5">NET SALARY</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#4F46E5">${rupee(netSalary)}</p>
          </div>
        </div>
        
        <div style="margin-bottom:20px">
          <p style="margin:0 0 8px;font-size:13px;color:#6B7280">Payment Date: ${formatDate(payDate)}</p>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div>
            <h4 style="margin:0 0 12px;font-size:14px;color:#374151">Earnings</h4>
            <div style="border-top:1px solid #E5E7EB;padding-top:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:#6B7280">Basic Salary</span>
                <span style="font-size:13px;font-weight:500">${rupee(baseSalary)}</span>
              </div>
              ${bonus ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:#6B7280">Bonus ${bonusReason ? `(${bonusReason})` : ''}</span>
                <span style="font-size:13px;color:#059669">+ ${rupee(bonus)}</span>
              </div>
              ` : ''}
              ${allowances ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:#6B7280">Allowances ${allowanceReason ? `(${allowanceReason})` : ''}</span>
                <span style="font-size:13px;color:#059669">+ ${rupee(allowances)}</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div>
            <h4 style="margin:0 0 12px;font-size:14px;color:#374151">Deductions</h4>
            <div style="border-top:1px solid #E5E7EB;padding-top:8px">
              ${deductions ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:#6B7280">Deductions ${deductionReason ? `(${deductionReason})` : ''}</span>
                <span style="font-size:13px;color:#DC2626">- ${rupee(deductions)}</span>
              </div>
              ` : ''}
              ${tax ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:#6B7280">Tax ${taxReason ? `(${taxReason})` : ''}</span>
                <span style="font-size:13px;color:#DC2626">- ${rupee(tax)}</span>
              </div>
              ` : ''}
              ${advanceDeduction ? `
              <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:13px;color:#6B7280">Advance Deduction</span>
                <span style="font-size:13px;color:#DC2626">- ${rupee(advanceDeduction)}</span>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div style="background:#F9FAFB;border-radius:8px;padding:12px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:600">Total Deductions</span>
            <span style="color:#DC2626">- ${rupee((parseFloat(deductions) || 0) + (parseFloat(tax) || 0) + (parseFloat(advanceDeduction) || 0))}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:8px;border-top:1px solid #E5E7EB">
            <span style="font-weight:700;font-size:14px">Net Payable</span>
            <span style="font-weight:700;font-size:16px;color:#4F46E5">${rupee(netSalary)}</span>
          </div>
        </div>
        
        ${notes ? `
        <div style="background:#FEF3C7;border-left:3px solid #F59E0B;padding:10px 12px;border-radius:6px;margin-bottom:16px">
          <p style="margin:0;font-size:12px;color:#92400E"><strong>Note:</strong> ${notes}</p>
        </div>
        ` : ''}
        
        <a href="${FRONTEND}/employee/payslips"
          style="display:block;margin-top:20px;text-align:center;background:#4F46E5;color:#fff;padding:12px;border-radius:8px;text-decoration:none;font-weight:500">
          View All Payslips
        </a>
        
        <p style="text-align:center;color:#9CA3AF;font-size:11px;margin-top:20px;padding-top:16px;border-top:1px solid #F1F3F9">
          This is an auto-generated document. For any discrepancies, please contact HR.
        </p>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payslip - ${payPeriod || formatDate(payDate)}`,
    html,
  });
};

const sendHolidayNotificationEmail = async ({ emails, action, holiday }) => {
  if (!emails || emails.length === 0) return;

  const formattedDate = new Date(holiday.holiday_date).toLocaleDateString("en-IN", {
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric",
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
        <p style="margin:6px 0 0;opacity:0.85;font-size:0.875rem">LEVROXEN SOFTWARE INNOVATIONS</p>
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
    from: process.env.MAIL_FROM || `"Levroxen HRM" <${process.env.EMAIL_USER}>`,
    to: emails.join(","),
    subject: subjects[action] || subjects.added,
    html,
  });
};


const sendAdvanceRequestEmail = async ({ name, email, companyName, amount, reason, requestId, status }) => {
  const statusConfig = {
    pending: { color: "#D97706", bg: "#FEF3C7", label: "Pending Approval" },
    approved: { color: "#059669", bg: "#ECFDF5", label: "Approved" },
    rejected: { color: "#DC2626", bg: "#FEE2E2", label: "Rejected" },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  
  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <h2>Salary Advance Request</h2>
        <p>${status === "approved" ? "✅ Request Approved" : status === "rejected" ? "❌ Request Status" : "⏳ Request Submitted"}</p>
      </div>
      <div style="padding:25px">
        <p>Hello <b>${name}</b>,</p>
        
        <div style="background:${config.bg};border-left:4px solid ${config.color};border-radius:8px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 8px"><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
          <p style="margin:0 0 8px"><strong>Reason:</strong> ${reason}</p>
          <p style="margin:0"><strong>Status:</strong> <span style="color:${config.color}">${config.label}</span></p>
        </div>
        
        ${status === "approved" ? `
        <div style="background:#ECFDF5;padding:12px;border-radius:8px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#059669">✓ Your advance request has been approved. The amount will be deducted from your future payslips in equal installments.</p>
        </div>
        ` : status === "rejected" ? `
        <div style="background:#FEE2E2;padding:12px;border-radius:8px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#DC2626">✗ Your advance request has been rejected. Please contact HR for more information.</p>
        </div>
        ` : `
        <div style="background:#FEF3C7;padding:12px;border-radius:8px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#D97706">⏳ Your request is pending review by the admin. You will be notified once a decision is made.</p>
        </div>
        `}
        
        <a href="${FRONTEND}/employee/salary-advance"
          style="display:block;margin:20px auto;padding:12px 25px;background:#4f46e5;color:#fff;text-align:center;text-decoration:none;border-radius:8px">
          View My Requests
        </a>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Salary Advance Request ${status === "approved" ? "Approved" : status === "rejected" ? "Update" : "Submitted"} - ${companyName}`,
    html,
  });
};


const sendIncrementNotificationEmail = async ({ name, email, companyName, type, oldValue, newValue, effectiveDate, remarks }) => {
  const isPromotion = type === "promotion";
  
  const html = `
  <div style="max-width:560px;margin:auto;font-family:Segoe UI;background:#f1f5f9;padding:20px">
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;text-align:center;color:#fff">
        <div style="font-size:2rem">${isPromotion ? "🏆" : "📈"}</div>
        <h2 style="margin:5px 0 0">${isPromotion ? "Congratulations on Your Promotion!" : "Salary Increment Notification"}</h2>
      </div>
      <div style="padding:25px">
        <p>Dear <b>${name}</b>,</p>
        <p>We are pleased to inform you that your ${isPromotion ? "promotion" : "salary"} has been updated effective <b>${formatDate(effectiveDate)}</b>.</p>
        
        <div style="background:#EEF2FF;border-radius:10px;padding:20px;margin:20px 0;text-align:center">
          ${isPromotion ? `
            <p style="margin:0 0 10px"><strong>Designation Change</strong></p>
            <p style="margin:0;font-size:20px"><span style="text-decoration:line-through;color:#9CA3AF">${oldValue}</span> → <strong style="color:#4F46E5">${newValue}</strong></p>
          ` : `
            <p style="margin:0 0 10px"><strong>Salary Change</strong></p>
            <p style="margin:0;font-size:20px"><span style="text-decoration:line-through;color:#9CA3AF">₹${oldValue.toLocaleString()}</span> → <strong style="color:#4F46E5">₹${newValue.toLocaleString()}</strong></p>
            <p style="margin:10px 0 0;font-size:14px;color:#059669">+${(((newValue - oldValue) / oldValue) * 100).toFixed(1)}% increase</p>
          `}
        </div>
        
        ${remarks ? `
        <div style="background:#FEF3C7;padding:12px;border-radius:8px;margin-bottom:16px">
          <p style="margin:0;font-size:13px;color:#92400E"><strong>Note from Management:</strong> ${remarks}</p>
        </div>
        ` : ''}
        
        <p style="color:#6B7280;font-size:13px">This change will be reflected in your upcoming payslip. We appreciate your continued contribution to the company's success.</p>
        
        <a href="${FRONTEND}/employee/career-history"
          style="display:block;margin:20px auto;padding:12px 25px;background:#4f46e5;color:#fff;text-align:center;text-decoration:none;border-radius:8px">
          View Career History
        </a>
      </div>
    </div>
  </div>`;

  return transporter.sendMail({
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${isPromotion ? "Promotion" : "Salary Increment"} Notification - ${companyName}`,
    html,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendTrialEmail,
  sendPayslipEmail,
  sendHolidayNotificationEmail,
  sendAdvanceRequestEmail,
  sendIncrementNotificationEmail,
};