// backend/routes/recommendation.js
const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();

router.get("/recommendations", (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) return res.status(400).json({ error: "Email required" });

  const python = spawn("python", ["./sentimentalAnalysis/recommend_scholarships.py", userEmail]);

  let data = "";
  python.stdout.on("data", (chunk) => {
    data += chunk.toString();
  });

  python.stderr.on("data", (error) => {
    console.error(`stderr: ${error}`);
  });

  python.on("close", (code) => {
    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (e) {
      console.error("Error parsing Python output", e);
      res.status(500).json({ error: "Failed to process recommendations" });
    }
  });
});

module.exports = router;
