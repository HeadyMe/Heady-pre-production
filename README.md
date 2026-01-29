# Heady_local
Official Local Heady Dev Repo

## Quick Start

### Setup Hugging Face Environment
Run the setup script to install all required Hugging Face libraries:

```bash
./setup_huggingface.sh
```

Note: The script is executable. If you encounter permission issues, run: `chmod +x setup_huggingface.sh`

This will install:
- Core libraries: transformers, datasets, accelerate, gradio, huggingface_hub
- Optimization libraries: bitsandbytes, optimum

After installation, authenticate with Hugging Face:

```bash
huggingface-cli login
```

You'll need a token from https://huggingface.co/settings/tokens

## Documentation

- [Architecture & AI Guidelines](ARCHITECTURE.md) - Project architecture, tech stack strategy, and workflow instructions

## Project Structure

- `setup_huggingface.sh` - Setup script for Hugging Face dependencies
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies
- `heady-manager.js` - Main application manager
