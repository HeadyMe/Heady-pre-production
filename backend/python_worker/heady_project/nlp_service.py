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
# ║  FILE: backend/python_worker/heady_project/nlp_service.py         ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import logging
import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM
from .utils import get_logger

logger = get_logger(__name__)

class NLPService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NLPService, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def initialize(self):
        if self.initialized:
            return

        logger.info("Initializing NLP models...")
        try:
            # Check for GPU
            device = 0 if torch.cuda.is_available() else -1
            device_name = torch.cuda.get_device_name(0) if device == 0 else "CPU"
            logger.info(f"Using device: {device_name}")

            # Summarization (T5-small is lightweight)
            self.summarizer = pipeline("summarization", model="t5-small", device=device)

            # Chat/Text Generation (DistilGPT2 is lightweight)
            self.generator = pipeline("text-generation", model="distilgpt2", device=device)

            self.initialized = True
            logger.info("NLP models initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize NLP models: {e}")
            self.initialized = False

    def summarize_text(self, text: str, max_length: int = 150, min_length: int = 30) -> str:
        if not self.initialized:
            self.initialize()

        try:
            # T5 handles "summarize: " prefix better for some variants, but raw text often works for the pipeline
            # Truncate if too long to avoid token limit errors (T5 limit is 512)
            input_text = "summarize: " + text[:2000]
            summary = self.summarizer(input_text, max_length=max_length, min_length=min_length, do_sample=False)
            return summary[0]['summary_text']
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            return "Error generating summary."

    def generate_response(self, prompt: str, max_length: int = 100) -> str:
        if not self.initialized:
            self.initialize()

        try:
            # distilgpt2 is a causal LM, so it continues text. We format it slightly.
            response = self.generator(prompt, max_length=max_length, num_return_sequences=1)
            return response[0]['generated_text']
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return "Error generating response."

nlp_service = NLPService()
