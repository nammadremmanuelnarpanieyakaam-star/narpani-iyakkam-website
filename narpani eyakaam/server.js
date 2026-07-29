require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const { addVolunteer, getVolunteers } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "nammadoctoremmanuelnarpanieyakaam@gmail.com";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- Optional email notifications ----------
   Only activates if EMAIL_USER + EMAIL_PASS are set in .env
   (use a Gmail "app password", not the normal account password).
------------------------------------------------------ */
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function notifyByEmail(entry) {
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: NOTIFY_EMAIL,
      subject: `New volunteer sign-up: ${entry.name}`,
      text: [
        `Name: ${entry.name}`,
        `Phone: ${entry.phone}`,
        `Email: ${entry.email || "-"}`,
        `Interested in: ${entry.interest || "-"}`,
        `Message: ${entry.message || "-"}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Email notification failed:", err.message);
  }
}

/* ---------- Rate limiting on the public form endpoint ---------- */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 submissions per IP per window
  message: { success: false, error: "Too many submissions. Please try again later." },
});

/* ---------- Routes ---------- */

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Submit volunteer form
app.post("/api/volunteers", formLimiter, async (req, res) => {
  const { name, phone, email, interest, message } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: "Name is required." });
  }
  if (!phone || !phone.trim()) {
    return res.status(400).json({ success: false, error: "Phone number is required." });
  }

  const entry = {
    name: name.trim(),
    phone: phone.trim(),
    email: (email || "").trim(),
    interest: (interest || "").trim(),
    message: (message || "").trim(),
  };

  try {
    const result = addVolunteer(entry);
    notifyByEmail(entry); // fire-and-forget
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    console.error("DB insert failed:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
  }
});

// List volunteers (admin only — requires x-api-key header)
app.get("/api/volunteers", (req, res) => {
  if (!ADMIN_KEY) {
    return res.status(503).json({ success: false, error: "Admin access is not configured on this server." });
  }
  const key = req.header("x-api-key");
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ success: false, error: "Unauthorized." });
  }
  res.json({ success: true, volunteers: getVolunteers() });
});

// Fallback to index.html for any other route (simple SPA-style serving)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`நற்பணி இயக்கம் server running at http://localhost:${PORT}`);
});
