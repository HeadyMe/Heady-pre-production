# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: HeadyAcademy/Tools/HuggingFace_Tool.py                     ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
HuggingFace_Tool.py - PYTHIA Tool
Interfaces with Hugging Face models for text generation, analysis, and inference.
"""

import sys
import os
import json
import argparse
from pathlib import Path

# Configure output directory
OUTPUT_DIR = Path(__file__).parent.parent / "Model_Output"

def run_inference(task, model=None, input_text=None, **kwargs):
    """
    Run inference using Hugging Face pipelines.
    
    Args:
        task (str): The task to perform (e.g., 'text-generation', 'sentiment-analysis', 'summarization')
        model (str): Optional model identifier
        input_text (str): The input text to process
    """
    try:
        from transformers import pipeline
    except ImportError:
        return {
            "success": False,
            "error": "The 'transformers' library is not installed. Please install it with: pip install transformers torch"
        }

    try:
        # Set up pipeline arguments
        pipeline_args = {"task": task}
        if model:
            pipeline_args["model"] = model
            
        print(f"[PYTHIA] Initializing pipeline for task: {task}...")
        if model:
            print(f"[PYTHIA] Using model: {model}")
            
        # Initialize pipeline
        # Note: This might download the model if not cached
        classifier = pipeline(**pipeline_args)
        
        # Run inference
        print(f"[PYTHIA] Processing input...")
        result = classifier(input_text, **kwargs)
        
        # Prepare output
        output_data = {
            "task": task,
            "model": model or "default",
            "input_preview": input_text[:50] + "..." if len(input_text) > 50 else input_text,
            "result": result,
            "timestamp": "now"
        }
        
        # Save result
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"hf_{task}_{os.urandom(4).hex()}.json"
        output_path = OUTPUT_DIR / filename
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2)
            
        print(f"[PYTHIA] Inference complete.")
        print(f"  Result: {result}")
        print(f"  Saved to: {output_path}")
        
        return {
            "success": True,
            "result": result,
            "output_file": str(output_path)
        }
        
    except Exception as e:
        error_msg = f"Inference failed: {str(e)}"
        print(f"[ERROR] {error_msg}")
        return {
            "success": False,
            "error": error_msg
        }

def main():
    parser = argparse.ArgumentParser(description="Heady HuggingFace Tool")
    parser.add_argument("--task", "-t", type=str, required=True, help="Task to perform (text-generation, sentiment-analysis, etc.)")
    parser.add_argument("--input", "-i", type=str, required=True, help="Input text")
    parser.add_argument("--model", "-m", type=str, help="Specific model to use")
    
    args = parser.parse_args()
    
    result = run_inference(args.task, args.model, args.input)
    
    # If called from another script, we might want to print the JSON result to stdout for parsing
    if not result["success"]:
        sys.exit(1)

if __name__ == "__main__":
    main()
