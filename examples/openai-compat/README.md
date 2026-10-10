# OpenAI SDK Compatibility Example

This example demonstrates how any existing application using the official `openai` Node.js / TypeScript SDK can switch seamlessly to your local private stack simply by overriding `baseURL`.

---

## Prerequisites

1. Have `local-ai-stack` up and running with the `standard` or `full` preset:
   ```bash
   npx local-ai-stack up
   ```
2. Pull the default model:
   ```bash
   npx local-ai-stack model install llama3.2:3b
   ```
3. Set `LOCAL_AI_API_KEY` to the generated `API_SECRET_KEY` for the stack before running the example.

---

## Running the Example

```bash
# Install dependencies
npm install

# Provide the gateway credential
export LOCAL_AI_API_KEY='<your API_SECRET_KEY>'

# Run the script
npm start
```
