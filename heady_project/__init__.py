"""
Heady Project - A Python-based data-processing framework.

This package provides core functionality for building, serving APIs,
and performing audits within the Heady ecosystem.
"""

__version__ = "1.0.0"
__author__ = "Heady Systems"

from .core import mint_coin, HeadyArchive

__all__ = ["mint_coin", "HeadyArchive", "__version__"]
