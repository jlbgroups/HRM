const nodemailer = require("nodemailer");
const puppeteer  = require("puppeteer-core");
const chromium   = require("@sparticuz/chromium");
const Letter     = require("../models/Letter");

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST || "smtp.gmail.com",
  port:   Number(process.env.MAIL_PORT) || 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ Mail transporter (letterController) error:", error.message);
  } else {
    console.log("✅ Mail transporter (letterController) ready");
  }
});

const subjects = {
  offer:      "Your Offer Letter — LEVROXEN SOFTWARE INNOVATIONS",
  experience: "Experience Certificate — LEVROXEN SOFTWARE INNOVATIONS",
  salary:     "Salary Slip — LEVROXEN SOFTWARE INNOVATIONS",
  relieving:  "Relieving Letter — LEVROXEN SOFTWARE INNOVATIONS",
};

const wrapEmail = (html) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
body{margin:0;padding:0;background:#f8fafc;font-family:Arial}
.shell{max-width:680px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden}
.body{padding:32px 40px}
.footer{padding:20px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8}
</style>
</head>
<body>
<div class="shell">
<div class="body">${html}</div>
<div class="footer">Official document from LEVROXEN SOFTWARE INNOVATIONS</div>
</div>
</body>
</html>
`;
const sendLetter = async (req, res) => {
  try {
    const {
      employeeId, employeeEmail, employeeName,
      letterType, htmlContent, notes,
      customTitle, customSubject,
    } = req.body;

    if (!employeeId || !employeeEmail || !letterType || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employeeId, employeeEmail, letterType, htmlContent",
      });
    }

    if (letterType === "custom") {
      if (!customTitle?.trim())
        return res.status(400).json({ success: false, message: "customTitle is required for custom letters" });
      if (!customSubject?.trim())
        return res.status(400).json({ success: false, message: "customSubject is required for custom letters" });
    }

    const emailSubject =
      letterType === "custom"
        ? customSubject
        : subjects[letterType] || "Letter from LEVROXEN SOFTWARE INNOVATIONS";

    await transporter.sendMail({
      from:    process.env.MAIL_FROM || `"LEVROXEN SOFTWARE INNOVATIONS" <${process.env.MAIL_USER}>`,
      to:      employeeEmail,
      subject: emailSubject,
      html:    wrapEmail(htmlContent),
    });

    try {
      const data = await Letter.create({
        employeeId, employeeName, employeeEmail,
        letterType, htmlContent,
        notes:         notes         || "",
        customTitle:   customTitle   || "",
        customSubject: customSubject || "",
        status:        "sent",
        sent_at:       new Date(),
        created_by:    req.user?.id  || null,
      });

      return res.status(201).json({
        success: true,
        message: `Letter sent to ${employeeEmail}`,
        data:    { id: data._id },
      });
    } catch (dbErr) {
      console.error("Letter sent but DB save failed:", dbErr.message);
      return res.status(201).json({
        success: true,
        message: `Letter sent to ${employeeEmail} (record save failed)`,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const saveDraft = async (req, res) => {
  try {
    const {
      employeeId, employeeEmail, employeeName,
      letterType, htmlContent, notes,
      customTitle, customSubject,
    } = req.body;

    if (!employeeId || !letterType || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employeeId, letterType, htmlContent",
      });
    }

    if (letterType === "custom") {
      if (!customTitle?.trim())
        return res.status(400).json({ success: false, message: "customTitle is required for custom letters" });
      if (!customSubject?.trim())
        return res.status(400).json({ success: false, message: "customSubject is required for custom letters" });
    }

    const existing = await Letter.findOne({ employeeId, letterType, status: "draft" });

    if (existing) {
      existing.htmlContent   = htmlContent;
      existing.notes         = notes         || "";
      existing.customTitle   = customTitle   || "";
      existing.customSubject = customSubject || "";
      existing.updated_at    = new Date();
      await existing.save();
      return res.json({ success: true, message: "Draft updated", data: { id: existing._id } });
    }

    const data = await Letter.create({
      employeeId, employeeName, employeeEmail,
      letterType, htmlContent,
      notes:         notes         || "",
      customTitle:   customTitle   || "",
      customSubject: customSubject || "",
      status:        "draft",
      created_by:    req.user?.id  || null,
    });

    return res.status(201).json({ success: true, message: "Draft saved", data: { id: data._id } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


const getHistory = async (req, res) => {
  try {
    const data = await Letter.find().sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


const getLetterById = async (req, res) => {
  try {
    const data = await Letter.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Letter not found" });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


const getMyLetters = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userId    = req.user?.id;

    if (!userEmail && !userId) {
      return res.status(400).json({ success: false, message: "User not identified" });
    }

    const data = await Letter.find({
      status: "sent",
      $or: [
        { employeeEmail: userEmail },
        { employeeId: String(userId) },
      ],
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const downloadLetter = async (req, res) => {
  let browser = null;
  try {
    const letter = await Letter.findById(req.params.id);
    if (!letter) {
      return res.status(404).json({ success: false, message: "Letter not found" });
    }
    const userEmail = req.user?.email;
    const userId    = req.user?.id;
    const isAdmin   = req.user?.role === "admin" || req.user?.role === "superadmin";

    if (!isAdmin) {
      const ownsLetter =
        letter.employeeEmail === userEmail ||
        String(letter.employeeId) === String(userId);
      if (!ownsLetter) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const isLocal = process.env.NODE_ENV === "development" || !process.env.RENDER;

    browser = await puppeteer.launch(
      isLocal
        ? {
            headless: "new",
            executablePath:
              process.platform === "win32"
                ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
                : process.platform === "darwin"
                ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
                : "/usr/bin/google-chrome",
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
          }
        : {
            args:            chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath:  await chromium.executablePath(),
            headless:        chromium.headless,
          }
    );

    const page = await browser.newPage();
    await page.setContent(wrapEmail(letter.htmlContent), { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();
    browser = null;

    const safeName = (letter.employeeName || letter.employeeId || "employee")
      .replace(/\s+/g, "_")
      .toLowerCase();
    const fileName = `${letter.letterType}-letter-${safeName}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer);

  } catch (err) {
    console.error("PDF generation error:", err);
    if (browser) {
      try { await browser.close(); } catch (_) {}
    }
    return res.status(500).json({
      success: false,
      message: "PDF generation failed: " + err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  }
};

module.exports = {
  sendLetter,
  saveDraft,
  getHistory,
  getLetterById,
  getMyLetters,
  downloadLetter,
};