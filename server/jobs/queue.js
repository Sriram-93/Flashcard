const { Agenda } = require('agenda');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { ChatGroq } = require("@langchain/groq");
const { z } = require("zod");
const mongoose = require('mongoose');

const Flashcard = require('../models/Flashcard');
const JobStatus = require('../models/JobStatus');
const { LocalHuggingFaceEmbeddings } = require('../utils/LocalEmbeddings');
require('dotenv').config();

// Establish Agenda instance using the existing MongoDB connection string
const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' } });

// Common Setup for AI
const embeddings = new LocalHuggingFaceEmbeddings();
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.1,
  maxTokens: 4000,
});

const flashcardSchema = z.object({
  question: z.string().describe("The question for the flashcard"),
  answer: z.string().describe("The complete, highly-detailed answer for the flashcard"),
  marks: z.coerce.number().describe("The mark value: 1, 2, 5, or 10"),
  difficulty: z.enum(["easy", "medium", "hard"]).describe("The algorithmic difficulty of the material")
});

const outputSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1).max(25).describe("An array of rich flashcards derived from the text context.")
});

const structuredLlm = model.withStructuredOutput(outputSchema, { name: "generate_flashcards" });

// Helper to update Job Tracker
async function updateJobStatus(jobId, status, progress, error = null) {
  await JobStatus.findOneAndUpdate(
    { jobId },
    { status, progress, error, updatedAt: new Date() }
  );
}

// Define Background Job
agenda.define('generate_flashcards', async (job) => {
  const { jobId, userId, filename, pdfText } = job.attrs.data;

  try {
    console.log(`[Job ${jobId}] Starting background generation for ${filename}...`);
    await updateJobStatus(jobId, 'chunking', 20);

    const fullText = pdfText;
    if (!fullText || fullText.trim().length < 50) {
      throw new Error('Insufficient text content extracted from PDF.');
    }

    // 1. Semantic Chunking
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const docs = await splitter.createDocuments([fullText], [{ userId, filename, jobId }]);

    // 2. Setup Vector Search (use native MongoDB client for LangChain compatibility)
    const client = mongoose.connection.getClient();
    const db = client.db();
    const collection = db.collection("vectors");
    
    // Patch collection for LangChain compatibility (needs collection.db.client.appendMetadata)
    if (!collection.db) {
      collection.db = db;
      if (!db.client) db.client = client;
    }
    if (typeof client.appendMetadata !== 'function') {
      client.appendMetadata = () => {};
    }

    const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection: collection,
      indexName: "vector_index", 
      textKey: "text",
      embeddingKey: "embedding",
    });

    console.log(`[Job ${jobId}] Inserting ${docs.length} semantic chunks to Vector DB...`);
    try {
      if (docs.length > 0) await vectorStore.addDocuments(docs);
    } catch (e) {
      console.warn(`[Job ${jobId}] Vector DB insertion skipped/failed: ${e.message}`);
    }

    await updateJobStatus(jobId, 'generating', 60);

    // 4. Retrieve Context
    const retrievedDocs = await vectorStore.similaritySearch("Provide core definitions, processes, and comprehensive analysis topics.", 8, {
      preFilter: { userId: { $eq: userId }, filename: { $eq: filename } }
    });

    let contextChunks = retrievedDocs.map(doc => doc.pageContent).join('\n\n');
    if (!contextChunks) contextChunks = docs.slice(0, 8).map(d => d.pageContent).join('\n\n');

    // 5. LLM Structured Generation
    console.log(`[Job ${jobId}] Sending to Groq...`);
    const prompt = `You are a strict educational AI. Based on the following textbook/document context, generate exactly 20 study flashcards.
    
    DISTRIBUTION REQUIREMENT (STRICT):
    - 6x 1-mark (basic explanations, 20-40 words)
    - 8x 2-mark (detailed context, 50-80 words)
    - 4x 5-mark (comprehensive analysis, 100-200 words)
    - 2x 10-mark (extensive multi-aspect analysis, 250+ words)
    
    NEVER truncate answers. Generate complete sentences.
    
    CONTEXT:
    ${contextChunks}`;

    let aiFlashcards = [];
    try {
      const llmResponse = await structuredLlm.invoke(prompt);
      aiFlashcards = llmResponse.flashcards;
    } catch (llmError) {
      throw new Error(`LLM Generation Failed: ${llmError.message}`);
    }

    if (!aiFlashcards || aiFlashcards.length === 0) {
      throw new Error("AI returned empty format.");
    }

    await updateJobStatus(jobId, 'saving', 90);

    // 6. DB Persistence
    const uploadDate = new Date();
    const finalCards = aiFlashcards.map((fc) => ({
      question: fc.question,
      answer: fc.answer,
      marks: fc.marks,
      difficulty: fc.difficulty || "medium",
      userId,
      filename,
      uploadDate
    }));

    // Only replace cards for the SAME document (not all user cards)
    await Flashcard.deleteMany({ userId, filename });
    await Flashcard.insertMany(finalCards);

    console.log(`[Job ${jobId}] Finished successfully.`);
    await updateJobStatus(jobId, 'completed', 100);

  } catch (err) {
    console.error(`[Job ${jobId}] CRITICAL ERROR:`, err.message);
    await updateJobStatus(jobId, 'failed', 0, err.message);
  }
});

// Start Agenda
agenda.on('ready', async () => {
  await agenda.start();
  console.log('✅ Agenda Queue Started');
});

module.exports = { agenda };
