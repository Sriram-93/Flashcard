const { Embeddings } = require("@langchain/core/embeddings");
const { pipeline } = require("@xenova/transformers");

class LocalHuggingFaceEmbeddings extends Embeddings {
  constructor(options = {}) {
    super(options);
    this.modelName = options.modelName || "Xenova/all-MiniLM-L6-v2";
    this.pipelinePromise = pipeline("feature-extraction", this.modelName, {
      quantized: true,
    });
  }

  async embedDocuments(texts) {
    const extractor = await this.pipelinePromise;
    const embeddings = [];
    for (const text of texts) {
      const output = await extractor(text, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(output.data));
    }
    return embeddings;
  }

  async embedQuery(text) {
    const extractor = await this.pipelinePromise;
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }
}

module.exports = { LocalHuggingFaceEmbeddings };
