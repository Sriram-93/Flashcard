const express = require("express");
const router = express.Router();
const History = require("../models/History");

// 📌 Save history when PDF uploaded
router.post("/", async (req, res) => {
  try {
    const { userId, fileName } = req.body;
    const history = new History({ userId, fileName });
    await history.save();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all history for user
router.get("/:userId", async (req, res) => {
  try {
    const history = await History.find({ userId: req.params.userId }).sort({ uploadedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
