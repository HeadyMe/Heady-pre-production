---
name: heady-data-processor
description: 'Processes data using Hugging Face models for text generation, embeddings, and QA tasks'
tools: []
---

# Heady Data Processing Agent

## Purpose
This agent specializes in data processing and machine learning inference using Hugging Face models. It handles text generation, embeddings extraction, and question-answering tasks through the HeadySystems Python worker (`src/process_data.py`).

## When to Use
- Text generation tasks requiring GPT-2 or other LLM models
- Creating embeddings for semantic search and similarity
- Question-answering with context
- Hugging Face API inference with retry logic and model loading
- Processing data streams through the Python worker

## Capabilities
### Text Generation
- Uses configurable HF models (default: gpt2)
- Supports custom parameters (temperature, max_new_tokens, etc.)
- Automatic model loading with wait_for_model option
- Retry logic with exponential backoff

### Embeddings
- Default model: sentence-transformers/all-MiniLM-L6-v2
- Mean pooling for feature extraction
- Batch processing support

### Question Answering
- Context-aware Q&A interface
- Safety guardrails (no secrets/tokens in responses)
- Temperature-controlled generation (default 0.2)
- Prompt echo removal

## Inputs
- **Text generation**: `prompt` (string), optional `model`, `parameters`
- **Embeddings**: `text` (string or array), optional `model`
- **QA**: `question` (string), `context` (string), optional `model`, `max_new_tokens`

## Outputs
- Structured JSON responses with:
  - `ok`: boolean status
  - `output`/`answer`/`embeddings`: processed results
  - `model`: model identifier used
  - `backend`: processing backend identifier
  - `request_id`: request tracking

## Tool Access
- Python subprocess execution via heady-manager.js
- Hugging Face Inference API (both router and legacy endpoints)
- Environment variable configuration (HF_TOKEN, model settings)

## Limitations
- Requires valid HF_TOKEN environment variable
- Rate limited by HF API quotas
- Maximum concurrency controlled by HEADY_PY_MAX_CONCURRENCY
- Timeout: 90 seconds per request (configurable)

## Progress Reporting
- Logs to stdout/stderr with timestamps
- JSON output for programmatic consumption
- Health check endpoint for worker status
- Graceful shutdown on interrupt
