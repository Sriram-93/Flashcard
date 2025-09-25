const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const flashcardRoutes = require('./routes/flashcards');
const path = require('path');
const historyRoutes = require("./routes/history");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/history", historyRoutes);
// DB Connect
mongoose.connect('mongodb://localhost:27017/flashcardDB')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);

// Serve React build (only when deployed / production)
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback: React routing support
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
