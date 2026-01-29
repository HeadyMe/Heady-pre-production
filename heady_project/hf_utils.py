"""
Hugging Face integration utilities for the Heady project.

This module provides utilities for leveraging Hugging Face models for:
- Summarization of build logs and documentation
- Code documentation generation
- Natural language queries and chat
- Content generation
"""

import logging
import os
from typing import Dict, Any, List, Optional, Union
from pathlib import Path

logger = logging.getLogger(__name__)

# Default models - lightweight for efficiency
DEFAULT_SUMMARIZATION_MODEL = os.getenv("HF_SUMMARIZATION_MODEL", "facebook/bart-large-cnn")
DEFAULT_TEXT_GENERATION_MODEL = os.getenv("HF_TEXT_MODEL", "gpt2")
DEFAULT_QA_MODEL = os.getenv("HF_QA_MODEL", "distilbert-base-cased-distilled-squad")


class HuggingFaceUtils:
    """
    Utilities for Hugging Face model integration.
    
    This class provides methods for common NLP tasks using Hugging Face models,
    with caching and error handling built-in.
    """
    
    def __init__(
        self,
        cache_dir: Optional[str] = None,
        use_auth_token: Optional[str] = None
    ):
        """
        Initialize Hugging Face utilities.
        
        Args:
            cache_dir: Directory for caching models (defaults to ~/.cache/huggingface)
            use_auth_token: Hugging Face API token for private models
        """
        self.cache_dir = cache_dir or os.getenv("HF_CACHE_DIR")
        self.use_auth_token = use_auth_token or os.getenv("HF_TOKEN")
        
        # Lazy-loaded pipelines
        self._summarizer = None
        self._generator = None
        self._qa_pipeline = None
        
        logger.info("Initialized HuggingFace utilities")
    
    def _get_summarizer(self):
        """Lazy-load the summarization pipeline."""
        if self._summarizer is None:
            try:
                from transformers import pipeline
                
                logger.info(f"Loading summarization model: {DEFAULT_SUMMARIZATION_MODEL}")
                self._summarizer = pipeline(
                    "summarization",
                    model=DEFAULT_SUMMARIZATION_MODEL,
                    cache_dir=self.cache_dir,
                    token=self.use_auth_token
                )
                logger.info("Summarization model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load summarization model: {e}")
                raise
        
        return self._summarizer
    
    def _get_generator(self):
        """Lazy-load the text generation pipeline."""
        if self._generator is None:
            try:
                from transformers import pipeline
                
                logger.info(f"Loading text generation model: {DEFAULT_TEXT_GENERATION_MODEL}")
                self._generator = pipeline(
                    "text-generation",
                    model=DEFAULT_TEXT_GENERATION_MODEL,
                    cache_dir=self.cache_dir,
                    token=self.use_auth_token
                )
                logger.info("Text generation model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load text generation model: {e}")
                raise
        
        return self._generator
    
    def _get_qa_pipeline(self):
        """Lazy-load the question-answering pipeline."""
        if self._qa_pipeline is None:
            try:
                from transformers import pipeline
                
                logger.info(f"Loading QA model: {DEFAULT_QA_MODEL}")
                self._qa_pipeline = pipeline(
                    "question-answering",
                    model=DEFAULT_QA_MODEL,
                    cache_dir=self.cache_dir,
                    token=self.use_auth_token
                )
                logger.info("QA model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load QA model: {e}")
                raise
        
        return self._qa_pipeline
    
    def summarize_text(
        self,
        text: str,
        max_length: int = 150,
        min_length: int = 40,
        do_sample: bool = False
    ) -> str:
        """
        Summarize text using a pre-trained model.
        
        Args:
            text: Text to summarize
            max_length: Maximum length of summary
            min_length: Minimum length of summary
            do_sample: Whether to use sampling for generation
            
        Returns:
            Summarized text
            
        Example:
            >>> utils = HuggingFaceUtils()
            >>> long_text = "Very long build log..."
            >>> summary = utils.summarize_text(long_text, max_length=100)
        """
        logger.info(f"Summarizing text of length {len(text)}")
        
        try:
            summarizer = self._get_summarizer()
            
            # Split if text is too long (models have token limits)
            max_input_length = 1024
            if len(text) > max_input_length:
                logger.warning(f"Text truncated from {len(text)} to {max_input_length} characters")
                text = text[:max_input_length]
            
            result = summarizer(
                text,
                max_length=max_length,
                min_length=min_length,
                do_sample=do_sample
            )
            
            summary = result[0]["summary_text"]
            logger.info(f"Generated summary of length {len(summary)}")
            
            return summary
            
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
            # Fallback to simple truncation
            return text[:max_length] + "..."
    
    def summarize_build_log(
        self,
        log_content: str,
        max_length: int = 200
    ) -> Dict[str, Any]:
        """
        Summarize a build log, extracting key information.
        
        Args:
            log_content: Build log content
            max_length: Maximum summary length
            
        Returns:
            Dictionary with summary and metadata
        """
        logger.info("Summarizing build log")
        
        # Extract key patterns
        errors = log_content.count("ERROR")
        warnings = log_content.count("WARNING")
        success = "success" in log_content.lower() or "completed" in log_content.lower()
        
        # Generate summary
        summary = self.summarize_text(log_content, max_length=max_length)
        
        return {
            "summary": summary,
            "errors": errors,
            "warnings": warnings,
            "success": success,
            "length": len(log_content)
        }
    
    def generate_docstring(
        self,
        function_signature: str,
        function_body: str,
        max_length: int = 100
    ) -> str:
        """
        Generate a docstring for a function using AI.
        
        Args:
            function_signature: The function signature
            function_body: The function implementation
            max_length: Maximum docstring length
            
        Returns:
            Generated docstring
        """
        logger.info(f"Generating docstring for: {function_signature}")
        
        prompt = f"""Generate a Python docstring for this function:

{function_signature}
{function_body}

Docstring:"""
        
        try:
            generator = self._get_generator()
            result = generator(prompt, max_length=max_length, num_return_sequences=1)
            docstring = result[0]["generated_text"].split("Docstring:")[-1].strip()
            
            logger.info("Generated docstring successfully")
            return docstring
            
        except Exception as e:
            logger.error(f"Docstring generation failed: {e}")
            return '"""TODO: Add docstring"""'
    
    def answer_question(
        self,
        question: str,
        context: str
    ) -> Dict[str, Any]:
        """
        Answer a question based on provided context.
        
        Args:
            question: User's question
            context: Context to search for answers
            
        Returns:
            Dictionary with answer, score, and metadata
            
        Example:
            >>> utils = HuggingFaceUtils()
            >>> answer = utils.answer_question(
            ...     "How do I run the build?",
            ...     readme_content
            ... )
        """
        logger.info(f"Answering question: {question}")
        
        try:
            qa_pipeline = self._get_qa_pipeline()
            
            result = qa_pipeline(question=question, context=context)
            
            logger.info(f"Answer found with score: {result['score']}")
            
            return {
                "answer": result["answer"],
                "score": result["score"],
                "start": result["start"],
                "end": result["end"]
            }
            
        except Exception as e:
            logger.error(f"Question answering failed: {e}")
            return {
                "answer": "I couldn't find an answer to that question.",
                "score": 0.0,
                "start": 0,
                "end": 0
            }
    
    def generate_release_notes(
        self,
        commits: List[str],
        max_length: int = 300
    ) -> str:
        """
        Generate release notes from commit messages.
        
        Args:
            commits: List of commit messages
            max_length: Maximum length of release notes
            
        Returns:
            Generated release notes
        """
        logger.info(f"Generating release notes from {len(commits)} commits")
        
        commits_text = "\n".join(commits)
        prompt = f"""Generate professional release notes from these commits:

{commits_text}

Release Notes:"""
        
        try:
            generator = self._get_generator()
            result = generator(prompt, max_length=max_length, num_return_sequences=1)
            notes = result[0]["generated_text"].split("Release Notes:")[-1].strip()
            
            logger.info("Generated release notes successfully")
            return notes
            
        except Exception as e:
            logger.error(f"Release notes generation failed: {e}")
            # Fallback to simple formatting
            return "Release Notes:\n" + "\n".join(f"- {commit}" for commit in commits[:10])


def summarize_file(
    file_path: str,
    max_length: int = 150
) -> str:
    """
    Summarize the contents of a file.
    
    Args:
        file_path: Path to file to summarize
        max_length: Maximum summary length
        
    Returns:
        File summary
    """
    utils = HuggingFaceUtils()
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return utils.summarize_text(content, max_length=max_length)
        
    except Exception as e:
        logger.error(f"Failed to summarize file {file_path}: {e}")
        return f"Failed to summarize: {str(e)}"
