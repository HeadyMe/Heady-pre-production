#!/bin/bash

# Exit on error
set -e

echo "Installing Hugging Face libraries..."

# 1. Install Core Hugging Face Libraries
# - transformers: The main library for models
# - datasets: For data loading
# - accelerate: For hardware optimization (GPU/MPS/CPU)
# - gradio: For the UI
# - huggingface_hub: For CLI authentication
echo "Installing core libraries..."
pip install transformers datasets accelerate gradio huggingface_hub

# 2. Install Optimization Libraries (Optional but recommended)
# - optimum: For ONNX/hardware specific acceleration
echo "Installing optimization libraries..."
pip install optimum

# - bitsandbytes: For 8-bit/4-bit quantization (Linux/Windows only)
# Skip on macOS as it's not supported
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "Installing bitsandbytes..."
    pip install bitsandbytes
else
    echo "Skipping bitsandbytes (not supported on macOS)"
fi

echo "✓ Installation complete!"

# 3. Interactive Login
echo "----------------------------------------------------------------"
echo "Please run 'huggingface-cli login' to authenticate your machine."
echo "You will need a token from https://huggingface.co/settings/tokens"
echo "----------------------------------------------------------------"
