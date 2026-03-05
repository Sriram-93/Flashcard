const mongoose = require('mongoose');

const JobStatusSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String },
  cloudUrl: { type: String },
  status: { type: String, enum: ['queued', 'downloading', 'chunking', 'generating', 'saving', 'completed', 'failed'], default: 'queued' },
  progress: { type: Number, default: 0 },
  error: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JobStatus', JobStatusSchema);
