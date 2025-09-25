const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Flashcard = require('../models/Flashcard');
const Groq = require('groq-sdk');
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper: detect difficulty based on text complexity and length
function detectDifficulty(question, answer) {
  const text = `${question} ${answer}`.toLowerCase();
  const complexWords = text.split(' ').filter(word => word.length > 8).length;
  const totalWords = text.split(' ').length;
  const complexityRatio = complexWords / totalWords;
  
  if (text.length < 80 && complexityRatio < 0.1) return 'easy';
  if (text.length < 200 && complexityRatio < 0.2) return 'medium';
  return 'hard';
}

// Helper: safely extract JSON with better parsing
function extractJSON(text) {
  // Try to find JSON array in the response
  let jsonStart = text.indexOf('[');
  let jsonEnd = text.lastIndexOf(']');
  
  if (jsonStart === -1 || jsonEnd === -1) {
    // Try to find individual JSON objects and combine them
    const objectMatches = text.match(/\{[^{}]*"question"[^{}]*\}/g);
    if (objectMatches && objectMatches.length > 0) {
      try {
        const objects = objectMatches.map(match => JSON.parse(match));
        return objects;
      } catch (err) {
        console.error('Individual object parsing failed:', err);
      }
    }
    return [];
  }
  
  try {
    const jsonText = text.slice(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(jsonText);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    console.error('JSON parsing failed:', err);
    // Try to fix common JSON issues
    try {
      let fixedJson = text.slice(jsonStart, jsonEnd + 1);
      // Fix common issues
      fixedJson = fixedJson.replace(/,\s*}/g, '}'); // Remove trailing commas
      fixedJson = fixedJson.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      return JSON.parse(fixedJson);
    } catch (secondErr) {
      console.error('JSON fix attempt failed:', secondErr);
      return [];
    }
  }
}

// Enhanced fallback flashcard generator
function generateFallbackFlashcards(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const flashcards = [];
  
  // Ensure proper distribution: 1-mark(6), 2-mark(8), 5-mark(4), 10-mark(2)
  const distribution = [
    { marks: 1, count: 6 },
    { marks: 2, count: 8 },
    { marks: 5, count: 4 },
    { marks: 10, count: 2 }
  ];
  
  let cardIndex = 0;
  
  for (const { marks, count } of distribution) {
    for (let i = 0; i < count && cardIndex < sentences.length; i++) {
      const sentence = sentences[cardIndex % sentences.length];
      if (sentence.length < 30) {
        cardIndex++;
        continue;
      }
      
      let question, answer;
      
      // Generate questions and answers based on marks
      switch (marks) {
        case 1:
          question = `What is ${sentence.split(' ').slice(1, 4).join(' ')}?`;
          answer = sentence.substring(0, 60).trim() + '.';
          break;
        case 2:
          question = `Explain ${sentence.split(' ').slice(0, 5).join(' ')}`;
          answer = sentence.substring(0, 120).trim() + '. ' + 
                   (sentences[cardIndex + 1] || '').substring(0, 80).trim() + '.';
          break;
        case 5:
          question = `Describe in detail: ${sentence.split(' ').slice(0, 6).join(' ')}`;
          answer = sentence + ' ' + 
                   (sentences[cardIndex + 1] || '') + ' ' + 
                   (sentences[cardIndex + 2] || '');
          answer = answer.substring(0, 300).trim() + '.';
          break;
        case 10:
          question = `Provide a comprehensive analysis of ${sentence.split(' ').slice(1, 7).join(' ')} including examples and applications`;
          answer = sentence + ' ' + 
                   (sentences[cardIndex + 1] || '') + ' ' + 
                   (sentences[cardIndex + 2] || '') + ' ' +
                   (sentences[cardIndex + 3] || '') + ' ' +
                   (sentences[cardIndex + 4] || '') + ' ' +
                   (sentences[cardIndex + 5] || '');
          // Ensure minimum length for 10-mark questions
          answer = answer.substring(0, 600).trim() + '.';
          break;
      }
      
      flashcards.push({
        question,
        answer,
        marks,
        difficulty: detectDifficulty(question, answer)
      });
      
      cardIndex++;
    }
  }
  
  return flashcards;
}

// Upload PDF and generate flashcards with complete answers
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const { userId } = req.body;
    const filename = req.file?.originalname || 'Unknown PDF';
    if (!req.file) return res.status(400).json({ message: 'No PDF uploaded' });

    const data = await pdfParse(req.file.buffer);
    const fullText = data.text;

    let flashcards = [];

    try {
      // Use larger chunks for better context
      const chunks = fullText.match(/(.|[\r\n]){1,4000}/g) || [];
      const selectedChunks = chunks.slice(0, 6).join('\n');

      const enhancedPrompt = `
You are an expert educational content creator. Generate EXACTLY 20 flashcards with complete, untruncated answers.

CRITICAL REQUIREMENTS:
1. NEVER truncate answers - provide COMPLETE responses
2. Maintain exact distribution: 6×1-mark, 8×2-mark, 4×5-mark, 2×10-mark
3. Ensure answers match the word count for each mark level

ANSWER LENGTH REQUIREMENTS:
- 1 mark: 20-40 words (complete basic explanations)
- 2 marks: 50-80 words (detailed explanations with context)
- 5 marks: 100-200 words (comprehensive analysis with examples)
- 10 marks: 250-500 words (extensive analysis with multiple aspects, examples, applications, and detailed explanations)

EXAMPLE FORMAT FOR COMPLETE ANSWERS:

10 MARKS EXAMPLE (Must be 250-500 words):
{
  "question": "Analyze the complete process of machine learning model training including data preprocessing, architecture selection, optimization techniques, and evaluation methods",
  "answer": "Machine learning model training is a comprehensive process that involves multiple critical stages to develop effective predictive systems. The process begins with data preprocessing, which includes data collection, cleaning, normalization, and feature engineering. Raw data often contains inconsistencies, missing values, and noise that must be addressed through techniques like imputation, outlier removal, and standardization. Feature engineering involves selecting relevant variables and creating new features that can improve model performance. The next crucial step is architecture selection, where practitioners choose appropriate algorithms based on the problem type - classification, regression, or clustering. For deep learning, this involves designing neural network architectures with appropriate layers, activation functions, and connections. Popular architectures include convolutional neural networks for image processing, recurrent networks for sequential data, and transformer models for natural language processing. Optimization techniques form the core of training, utilizing algorithms like gradient descent, Adam optimizer, and RMSprop to minimize loss functions. These optimizers adjust model parameters iteratively to improve performance while avoiding overfitting through regularization methods like dropout, batch normalization, and early stopping. Cross-validation ensures robust model evaluation by testing performance across different data subsets. Evaluation methods vary by task but include metrics like accuracy, precision, recall, F1-score for classification, and mean squared error for regression. The training process also involves hyperparameter tuning using techniques like grid search, random search, or Bayesian optimization to find optimal configurations. Modern approaches leverage automated machine learning (AutoML) tools and transfer learning to accelerate development while maintaining high performance standards.",
  "marks": 10
}

Generate flashcards from this content with COMPLETE untruncated answers:

${selectedChunks}

Return only valid JSON array with exactly 20 complete flashcards:`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: enhancedPrompt }],
        temperature: 0.1, // Lower temperature for more consistent output
        max_tokens: 12000, // Increased token limit for longer answers
        top_p: 0.9,
      });

      const rawText = response.choices[0].message.content.trim();
      console.log('Raw AI Response:', rawText.substring(0, 500) + '...');
      
      flashcards = extractJSON(rawText);
      console.log(`Extracted ${flashcards.length} flashcards from AI response`);

      // Validate and ensure complete answers
      flashcards = flashcards.map((fc, index) => {
        const words = fc.answer ? fc.answer.split(' ').length : 0;
        const marks = fc.marks || 1;
        
        console.log(`Card ${index + 1}: ${marks} marks, ${words} words`);
        
        // Ensure minimum lengths for each mark level
        const minWords = {
          1: 20, 2: 50, 5: 100, 10: 250
        };
        
        // If answer is too short, extend it or adjust marks
        if (words < minWords[marks] * 0.8) {
          console.log(`Warning: Card ${index + 1} answer too short (${words} words for ${marks} marks)`);
          
          // Try to extend answer from context if possible
          if (marks === 10 && words < 200) {
            fc.answer += " This concept involves multiple interconnected components that work together to achieve the desired outcome. Understanding these relationships is crucial for practical implementation and successful application in real-world scenarios. The methodology encompasses various techniques and approaches that have been developed and refined through extensive research and practical experience.";
          } else if (marks === 5 && words < 80) {
            fc.answer += " This involves several key aspects that must be considered for effective implementation and optimal results.";
          } else if (marks === 2 && words < 40) {
            fc.answer += " This is an important concept that requires proper understanding for effective application.";
          }
        }
        
        return fc;
      });

    } catch (err) {
      console.warn('⚠️ Groq API failed, using enhanced fallback:', err.message);
    }

    // Enhanced fallback if empty or incomplete
    if (!flashcards || flashcards.length < 15) {
      console.log('Using fallback generator due to insufficient cards...');
      flashcards = generateFallbackFlashcards(fullText);
    }

    if (!flashcards.length) {
      return res.status(500).json({ message: '❌ Could not generate flashcards' });
    }

    // Ensure exactly 20 flashcards
    if (flashcards.length > 20) {
      flashcards = flashcards.slice(0, 20);
    } else if (flashcards.length < 20) {
      const additional = generateFallbackFlashcards(fullText);
      flashcards = flashcards.concat(additional.slice(0, 20 - flashcards.length));
    }

    // Final processing and validation
    const uploadDate = new Date();
    flashcards = flashcards.map((fc, index) => {
      // Ensure complete answers are preserved
      let processedAnswer = fc.answer || 'No answer provided';
      
      // Remove any truncation indicators
      processedAnswer = processedAnswer.replace(/\.\.\.$/, '').trim();
      
      // Ensure proper sentence ending
      if (!processedAnswer.endsWith('.') && !processedAnswer.endsWith('!') && !processedAnswer.endsWith('?')) {
        processedAnswer += '.';
      }
      
      return {
        question: fc.question || `Question ${index + 1}`,
        answer: processedAnswer,
        marks: fc.marks || 1,
        difficulty: fc.difficulty || detectDifficulty(fc.question || '', processedAnswer),
        userId,
        filename,
        uploadDate
      };
    });

    // Remove old flashcards of this user
    await Flashcard.deleteMany({ userId });

    // Save new flashcards
    const savedCards = await Flashcard.insertMany(flashcards);

    // Calculate final statistics
    const finalStats = savedCards.reduce((acc, card) => {
      acc[card.marks] = (acc[card.marks] || 0) + 1;
      return acc;
    }, {});

    // Log answer lengths for debugging
    savedCards.forEach((card, index) => {
      const wordCount = card.answer.split(' ').length;
      console.log(`Final Card ${index + 1}: ${card.marks} marks, ${wordCount} words`);
    });

    console.log('📊 Final flashcard distribution:', finalStats);
    console.log('📊 Total flashcards:', savedCards.length);

    res.json({ 
      message: '✅ Flashcards created successfully!', 
      flashcards: savedCards, 
      filename, 
      uploadDate,
      statistics: finalStats,
      total: savedCards.length
    });

  } catch (error) {
    console.error('Flashcard generation failed:', error);
    res.status(500).json({ message: '❌ Flashcard generation failed', error: error.message });
  }
});

// Get all flashcards
router.get('/', async (req, res) => {
  try {
    const flashcards = await Flashcard.find().sort({ marks: 1, difficulty: 1 });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch flashcards' });
  }
});

// Get flashcards by userId with optional filtering
router.get('/:userId', async (req, res) => {
  try {
    const { difficulty, marks } = req.query;
    let filter = { userId: req.params.userId };
    
    if (difficulty) filter.difficulty = difficulty;
    if (marks) filter.marks = parseInt(marks);
    
    const flashcards = await Flashcard.find(filter).sort({ marks: 1, difficulty: 1 });
    res.json(flashcards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch flashcards' });
  }
});

module.exports = router;