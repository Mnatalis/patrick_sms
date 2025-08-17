const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const app = express();
app.use(express.json());

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM; // Twilio-номер (E.164)
const TO = process.env.DEST_PHONE; // фиксированный получатель (E.164)

app.post("/send", async (req, res) => {
  const { full_name, phone, message } = req.body || {};
  if (!full_name || !phone || !message)
    return res
      .status(400)
      .json({ error: "Required: full_name, phone, message" });

  const body = `New inquiry\nName: ${full_name}\nPhone: ${phone}\nMessage: ${message}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`;
    const form = new URLSearchParams({ From: FROM, To: TO, Body: body });

    const { data } = await axios.post(url, form.toString(), {
      auth: { username: SID, password: TOKEN },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    res.json({
      ok: true,
      sid: data.sid,
      status: data.status,
      to: data.to,
      from: data.from,
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.response?.data || e.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 SMS API on :3000"));
