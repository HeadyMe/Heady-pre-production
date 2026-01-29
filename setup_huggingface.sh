#!/bin/bash

# 1. Install Core Hugging Face Libraries
# - transformers: The main library for models
# - datasets: For data loading
# - accelerate: For hardware optimization (GPU/MPS/CPU)
# - gradio: For the UI
# - huggingface_hub: For CLI authentication
pip install transformers datasets accelerate gradio huggingface_hub

# 2. Install Optimization Libraries (Optional but recommended)
# - bitsandbytes: For 8-bit/4-bit quantization (Linux/Windows only)
# - optimum: For ONNX/hardware specific acceleration
pip install bitsandbytes optimum

# 3. Interactive Login
echo "----------------------------------------------------------------"
echo "Please run 'huggingface-cli login' to authenticate your machine."
echo "You will need a token from https://huggingface.co/settings/tokens"
echo "----------------------------------------------------------------"
