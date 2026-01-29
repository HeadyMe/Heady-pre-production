"""
Heady Project - A Python-based data-processing framework.

This package provides core functionality for building, serving APIs,
and performing audits within the Heady ecosystem, with integrated
Hugging Face AI capabilities.
"""

__version__ = "1.0.0"
__author__ = "Heady Systems"

from .core import mint_coin, HeadyArchive
from .hf_utils import HuggingFaceUtils, summarize_file

__all__ = [
    "mint_coin",
    "HeadyArchive",
    "HuggingFaceUtils",
    "summarize_file",
    "__version__"
]
