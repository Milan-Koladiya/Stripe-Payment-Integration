const express = require("express");
const app = express();
require("dotenv").config();
const twilio = require("twilio")(
  process.env.TWILLIO_ACCOUNT_SID,
  process.env.TWILLIO_AUTH_TOKEN
);

app.use(express.json());

app.post("/sendmessage", async (req, res) => {
  try {
    const { message, to, from } = req.body;
    const messageRes = await twilio.messages.create({
      channel: "call",
      body: message,
      from,
      to,
    });
    console.log("messageRes => ", messageRes);
    res.json({ success: "true", response: messageRes });
  } catch (error) {
    console.log("error => ", error);
    res.json({ success: "false", error: error.message });
  }
});

app.post("/sendcall", async (req, res) => {
  try {
    const { message, to, from } = req.body;
    const messageRes = await twilio.calls.create({
      url: "http://demo.twilio.com/docs/voice.xml",
      to: "+917069680214",
      from: "+14803513824",
    });
    res.json({ success: "true", response: messageRes });
  } catch (error) {
    console.log("error => ", error);
    res.json({ success: "false", error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Twillio & Express Server running on 3000 PORT");
});
