const { pipeline } = require('@xenova/transformers');
const mongoose = require('mongoose');

async function testEmbeddings() {
  try {
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
    const output = await extractor('This is a test document', { pooling: 'mean', normalize: true });
    console.log('Embedding output length:', Array.from(output.data).length);
  } catch (err) {
    console.error('Error:', err);
  }
}

testEmbeddings();
