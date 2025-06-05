// server/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const gTTS = require("gtts");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/synthesize", async (req, res) => {
  const { text, languageCode } = req.body;
  console.log("Received request to synthesize");
  console.log("Text:", text);
  console.log("Language:", languageCode);

  if (!text || !languageCode) {
    console.log("❌ Missing text or languageCode");
    return res.status(400).send("Missing text or languageCode");
  }

  const filename = `output_${Date.now()}.mp3`;
  const filepath = path.join(__dirname, filename);

  const gtts = new gTTS(text, languageCode);

  // Set a 20-second timeout to catch hanging issues
  const timeout = setTimeout(() => {
    console.error("⏱️ gTTS save is taking too long — likely no internet access.");
    return res.status(504).send("Text-to-speech timeout — likely offline.");
  }, 20000);

  try {
    gtts.save(filepath, function (err) {
      clearTimeout(timeout);
      console.log("Inside gtts.save callback");

      if (err) {
        console.error("❌ Error during gtts.save:", err);
        return res.status(500).send("Failed to synthesize speech");
      }

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
      });

      const stream = fs.createReadStream(filepath);
      stream.pipe(res);

      res.on("finish", () => {
        console.log("✅ Audio sent successfully. Cleaning up.");
        fs.unlinkSync(filepath);
      });
    });
  } catch (err) {
    clearTimeout(timeout);
    console.error("❌ Unexpected error:", err);
    return res.status(500).send("Internal server error");
  }
});

app.get("/", (req, res) => {
  res.send("✅ TTS Server is running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ TTS Server running on http://localhost:${PORT}`));
