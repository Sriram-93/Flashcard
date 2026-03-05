const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const { agenda } = require('../jobs/queue');
const JobStatus = require('../models/JobStatus');
const Flashcard = require('../models/Flashcard');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Use memory storage — read PDF buffer in request, extract text, then pass to job
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

// Upload PDF and queue flashcard generation
router.post('/upload', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });

    const filename = req.file.originalname || 'Unknown PDF';
    const jobId = new mongoose.Types.ObjectId().toString();

    // Extract PDF text NOW while we have the buffer
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length < 50) {
      return res.status(400).json({ message: 'PDF has insufficient readable text content.' });
    }

    // Create Job Tracker
    const newJob = new JobStatus({
      jobId,
      userId,
      filename,
      cloudUrl: '', // No Cloudinary URL needed
      status: 'queued',
      progress: 0,
    });
    await newJob.save();

    console.log(`[Queue] Enqueuing: ${filename} for ${userId} -> ${jobId} (${pdfText.length} chars extracted)`);

    // Fire off Background Worker with pre-extracted text
    await agenda.now('generate_flashcards', {
      jobId, userId, filename, pdfText
    });

    // Return the jobId immediately so the client can begin polling/SSE
    res.status(202).json({
      message: '✅ PDF Uploaded. Background AI Generation started.',
      jobId,
      filename,
    });

  } catch (error) {
    console.error('❌ Upload Pipeline failed:', error);
    res.status(500).json({ message: '❌ PDF Upload failed', error: error.message });
  }
});

/**
 * Server-Sent Events (SSE) Endpoint for real-time progress.
 * Client connects here and listens to stream of status updates.
 */
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Push updates every second
  const intervalId = setInterval(async () => {
    try {
      const job = await JobStatus.findOne({ jobId });
      if (!job) {
        res.write(`data: ${JSON.stringify({ error: "Job not found" })}\n\n`);
        clearInterval(intervalId);
        res.end();
        return;
      }

      const payload = {
        status: job.status,
        progress: job.progress,
        error: job.error,
      };

      res.write(`data: ${JSON.stringify(payload)}\n\n`);

      // Close stream when done
      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(intervalId);
        res.end();
      }
    } catch (e) {
      clearInterval(intervalId);
      res.end();
    }
  }, 1000);

  // If client drops connection
  req.on('close', () => clearInterval(intervalId));
});

// Get all flashcards for authenticated user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ userId: req.user.id }).sort({ uploadDate: -1, marks: 1, difficulty: 1 });
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch' });
  }
});

// Dashboard Analytics Stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const allCards = await Flashcard.find({ userId });

    // Group by filename to get decks
    const deckMap = {};
    allCards.forEach(card => {
      const key = card.filename || 'Unknown';
      if (!deckMap[key]) {
        deckMap[key] = { filename: key, uploadDate: card.uploadDate, cardCount: 0 };
      }
      deckMap[key].cardCount++;
    });

    const decks = Object.values(deckMap).sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    // Marks distribution
    const markDistribution = { 1: 0, 2: 0, 5: 0, 10: 0 };
    allCards.forEach(card => {
      const m = Number(card.marks) || 1;
      if (markDistribution[m] !== undefined) markDistribution[m]++;
    });

    // Difficulty distribution
    const diffDistribution = { easy: 0, medium: 0, hard: 0 };
    allCards.forEach(card => {
      const d = (card.difficulty || 'medium').toLowerCase();
      if (diffDistribution[d] !== undefined) diffDistribution[d]++;
    });

    res.json({
      totalDecks: decks.length,
      totalCards: allCards.length,
      markDistribution,
      diffDistribution,
      recentDecks: decks.slice(0, 5),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Get flashcards by userId with optional filtering (secured)
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { difficulty, marks } = req.query;
    let filter = { userId: req.user.id }; // Use cookie user, ignore URL param for security
    if (difficulty) filter.difficulty = difficulty;
    if (marks) filter.marks = parseInt(marks);
    
    const flashcards = await Flashcard.find(filter).sort({ marks: 1, difficulty: 1 });
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch' });
  }
});

module.exports = router;