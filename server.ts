import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/makeCall", async (req, res) => {
    const { to, message } = req.body;
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ error: "Twilio credentials (SID / Auth Token) are not configured." });
    }

    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const call = await client.calls.create({
        twiml: `<Response><Say>${message}</Say></Response>`,
        to: to,
        from: "+17016020070", // Your Twilio Phone number
      });

      res.json({ success: true, callSid: call.sid });
    } catch (error: any) {
      console.error("Error making phone call:", error);
      res.status(500).json({ error: error.message || "Failed to make phone call" });
    }
  });

  app.post("/api/sendSms", async (req, res) => {
    const { to, message } = req.body;
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(500).json({ error: "Twilio credentials (SID / Auth Token) are not configured." });
    }

    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      
      const messageResponse = await client.messages.create({
        body: message,
        to: to,
        from: "+17016020070", // Your Twilio Phone number
      });

      res.json({ success: true, messageSid: messageResponse.sid });
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      res.status(500).json({ error: error.message || "Failed to send SMS" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
