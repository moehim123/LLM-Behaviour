# Maincode take home . LLM experiments UI

This is a lightweight experiments UI for running prompts against local Ollama models, saving experiments and runs in localStorage.

Tech
React + TypeScript + Vite
Tailwind
Ollama running via Docker Compose
State persisted in browser localStorage

## Prerequisites

You need these installed
Node.js 18 or newer
Docker Desktop

## 1. Start Ollama with Docker

From the project root

docker compose up -d

Check it is running

curl http://localhost:11434/api/tags

If you see a JSON response, Ollama is up.

## 2. Pull the model you want to use

The UI can call any model you have pulled into Ollama.
Example

docker exec -it ollama ollama pull llama3.2:3b

Optional second model

docker exec -it ollama ollama pull mistral:7b

Notes about memory
Some models require more RAM. If you see an error like “requires more system memory”, use a smaller model or increase Docker Desktop memory.

## 3. Install and run the frontend

npm install
npm run dev

Open the app

http://localhost:5173

## How it works

Experiments and runs are stored in localStorage under

maincode_state_v1

Runs are executed by calling Ollama’s generate endpoint.
The UI captures
Model name
Prompt
System prompt if provided
Temperature
Max tokens
Latency (derived from Ollama response timing)

## Troubleshooting

### Request failed or 404
Make sure Ollama is running on port 11434 and docker compose is up.
Then confirm the frontend is calling the correct endpoint.

Quick check

curl http://localhost:11434/api/tags

### Model not found
Pull the model first

docker exec -it ollama ollama pull llama3.2:3b

### Not enough memory for a model
Use a smaller model or increase Docker Desktop memory.
For example llama3.2:3b is usually safer than mistral:7b on lower memory machines.

## Stop services

docker compose down