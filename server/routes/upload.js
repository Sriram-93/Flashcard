const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Flashcard = require('../models/Flashcard');
const Upload = require('../models/Upload');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helper
function detectDifficulty(question, answer) {
  const text = `${question} ${answer}`.toLowerCase();
  if (text.length < 50) return 'easy';
  if (text.length < 100) return 'medium';
  return 'hard';
}

// 📌 Upload PDF Route
router.post('/upload', authMiddleware, upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' });

    const data = await pdfParse(req.file.buffer);
    const lines = data.text.split('\n').filter(l => l.trim() !== '');
    const flashcards = [];

    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i + 1]) {
        flashcards.push({
          userId: req.user.id,
          question: lines[i].trim(),
          answer: lines[i + 1].trim(),
          difficulty: detectDifficulty(lines[i], lines[i + 1])
        });
      }
    }

    // 🔥 Remove old flashcards of this user
    await Flashcard.deleteMany({ userId: req.user.id });

    // ✅ Save new flashcards
    const savedFlashcards = await Flashcard.insertMany(flashcards);

    // ✅ Save Upload metadata for history
    const newUpload = await Upload.create({ userId: req.user.id, filename: req.file.originalname });

    res.json({
      message: '✅ Flashcards uploaded and saved!',
      flashcards: savedFlashcards,
      upload: newUpload
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// 📌 Get all uploads for a user (History sidebar)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const uploads = await Upload.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
    res.json(uploads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch upload history' });
  }
});

// 📌 Get flashcards by uploadId
router.get('/byUpload/:uploadId', authMiddleware, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.id, uploadId: req.params.uploadId });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

module.exports = router;
