const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: { type: String },        // Store PDF name
  uploadDate: { type: Date, default: Date.now }, // Store upload date
  question: { type: String, required: true },
  answer: { type: String, required: true },
  marks: { type: Number, required: true },
  difficulty: { type: String, required: true },
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
