# RAG Pipeline Example with Qdrant & Ollama

This example demonstrates a complete **Retrieval-Augmented Generation (RAG)** pipeline using:
1. **Ollama** embeddings (`nomic-embed-text`) via the API Gateway (`/v1/embeddings`)
2. **Qdrant** vector database for indexing and cosine similarity search
3. **Ollama** chat completions (`llama3.2:3b`) via the API Gateway (`/v1/chat/completions`)

---

## Prerequisites

1. Start `local-ai-stack` with the `standard` preset:
   ```bash
   npx local-ai-stack init --preset standard --yes
   npx local-ai-stack up
   ```
2. Pull required models:
   ```bash
   npx local-ai-stack model install llama3.2:3b
   npx local-ai-stack model install nomic-embed-text
   ```

---

## Running the Pipeline

```bash
# 1. Install dependencies
npm install

# 2. Ingest sample documents into Qdrant
npm run ingest

# 3. Ask questions augmented with retrieved knowledge
npm run query "How does quantization help run models on laptops?"
```
