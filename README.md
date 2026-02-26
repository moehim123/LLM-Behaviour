# Maincode LLM Runner


## 1. Quickstart

### Prerequisites

Make sure the following are installed:

Docker with Docker Compose and you are logged in in your desktop 
Node.js version 18 or newer

### Setup and run

Clone the repository and start the local services:

git clone <YOUR_REPO_URL>  
cd maincode project  
docker compose up -d

Install dependencies and start the development server:

npm install  
npm run dev

Open the application:


Model downloads

There is no need to manually download models.

When the Ollama container starts, models are fetched automatically the first time they are used. The initial request for a model may take longer due to the download. 

If you prefer to download models ahead of time, you can run: 

docker exec -it ollama ollama pull llama3.2:3b   
docker exec -it ollama ollama pull mistral:7b 

---

### 2. Architecture

The application is structured around a few simple layers.

The React UI renders the layout, handles interactions, and manages view state.  
The API layer is responsible for communicating with the local backend route.  
Ollama runs inside Docker and executes model inference.  
Persistence is handled using localStorage for fast prototyping.

Data flow

A prompt is entered in Run Mode.  
The UI immediately inserts a pending run for responsiveness.  
The API helper sends the request to the backend route.  
Ollama generates a response.  
The run updates to complete or error.  
User annotations such as score, tags, and notes are stored locally.

---

### 3. Design Decisions

Experiment Centric Data Model

The application is structured around experiments, with runs living inside an experiment rather than existing as isolated records. This allows model outputs, parameters, and evaluations to be understood within a clear context. The goal was to support future scaling where comparisons, scoring patterns, and behavioural analysis are tied to a specific line of inquiry rather than mixed globally. The experiment also acts as the logical home for a system prompt, enabling controlled testing conditions across multiple runs.

Quantifiable Tagging Instead of Binary Labels

Tags were designed to carry weight rather than behave as simple on or off labels. Repeated interactions increase a tag’s strength, allowing a run to be described in degrees such as “more accurate” rather than forcing a binary judgement. This opens the door for more nuanced evaluation models where qualitative observations can gradually contribute to scoring or ranking mechanisms instead of remaining purely descriptive metadata.

Run Level Annotation Layer

Notes and tags are attached directly to runs rather than experiments. This keeps interpretation and evaluation coupled to the exact model response that produced them. It avoids ambiguity when experiments contain many runs with different parameters or behaviours, and it mirrors how real model analysis workflows operate where each output may require independent judgement.

Side by Side Comparison Layout

Comparison Mode presents runs next to each other with a concise summary rather than attempting a dense analytical view. The priority was rapid cognitive scanning and quick pattern recognition. While a tabular or statistical comparison interface may be more powerful later, the current design favors immediacy and readability during exploratory testing.

Overview Stats Reflect the Active Context

Experiment overview statistics are positioned near the experiment identity to reinforce the idea that metrics are contextual, not global. In Comparison Mode the same region is intended to reflect the currently inspected runs, strengthening the mental model that evaluation depends on what is being examined rather than representing static historical aggregates.
---

### 4. Model Rationale

Two models were selected to create a clear contrast in behavior.

llama3.2:3b provides fast responses and is well suited for quick iteration.  
mistral:7b produces stronger outputs but requires more system resources.

In practice, the smaller model feels more responsive while the larger model can show noticeable latency or memory constraints depending on the machine. 

---

### 5. Observations and Surprises

Latency variability is more visible than expected, especially on first runs or after switching models.

Model failures related to memory highlight the importance of clear feedback in local tooling.

Filtering interactions benefit from an explicit Search action. Without it, sliders can unintentionally hide results.

---

### 6. Unfinished Work

Better handling for model availability and missing downloads. 

Richer comparison summaries that include annotations and qualitative changes. Maybe a table overview 

Export and import capabilities for experiments.

Per experiment UI preferences such as remembering filters and selected models. 