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
3. Set `LOCAL_AI_API_KEY` to the generated `API_SECRET_KEY` for the stack before running the scripts.

---

## Running the Pipeline

```bash
# 1. Install dependencies
npm install

# 2. Provide the gateway credential
export LOCAL_AI_API_KEY='<your API_SECRET_KEY>'

# 3. Ingest sample documents into Qdrant
npm run ingest

# 4. Ask questions augmented with retrieved knowledge
npm run query "How does quantization help run models on laptops?"
```
