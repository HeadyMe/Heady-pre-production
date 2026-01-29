# Project Architecture & AI Guidelines

## Project Mission
This project utilizes the Hugging Face ecosystem to build [Insert Project Goal Here, e.g., a sentiment analysis tool].

## Tech Stack Strategy

### Model Hub
We use models from the Hugging Face Hub. Do not cache models locally in the repo; rely on the default `~/.cache/huggingface`.

### Inference
We use the Hugging Face Inference API for production and local `transformers.pipeline` for development.

### Interface
The UI is built using Gradio.

## Knowledge Bank (Common Issues)

### Error: OutOfMemoryError
**Fix:** Enable 4-bit quantization (`load_in_4bit=True`) or reduce batch size.

### Error: Pad token ID warnings
**Fix:** Explicitly set `tokenizer.pad_token = tokenizer.eos_token`.

### Error: Gated Model Access
**Fix:** Ensure `huggingface-cli login` has been run.

## Workflow Instructions for Agents

### New Features
When adding a new model, create a small test script in `tests/` to verify it loads before integrating it into the main app.

### Refactoring
When refactoring, preserve the `device_map="auto"` argument to ensure cross-platform compatibility.

### Dependencies
If you import a new HF library, immediately add it to `requirements.txt`.
