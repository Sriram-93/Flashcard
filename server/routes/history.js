const express = require("express");
const router = express.Router();
const History = require("../models/History");
const authMiddleware = require('../middleware/auth');

// 📌 Save history when PDF uploaded
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { fileName } = req.body;
    const history = new History({ userId: req.user.id, fileName });
    await history.save();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get all history for user (Secure)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
