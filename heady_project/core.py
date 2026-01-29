"""
Core functionality for the Heady data-processing framework.

This module provides essential data processing and archiving functions.
"""

import json
import logging
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from pathlib import Path

# Configure structured logging
logger = logging.getLogger(__name__)


def mint_coin(
    value: float,
    currency: str = "USD",
    metadata: Optional[Dict[str, Any]] = None,
    version: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new coin (data token) with specified value and metadata.
    
    Args:
        value: The numerical value of the coin
        currency: The currency type (default: USD)
        metadata: Optional metadata dictionary to attach to the coin
        version: Optional version string (defaults to environment variable or package version)
    
    Returns:
        Dictionary containing coin details with timestamp and unique ID
        
    Example:
        >>> coin = mint_coin(100.0, "USD", {"source": "user_payment"})
        >>> print(coin["value"])
        100.0
    """
    if version is None:
        version = os.getenv("HEADY_VERSION", "1.0.0")
    
    from . import __version__
    actual_version = version or __version__
    
    coin_data = {
        "id": f"coin_{datetime.now(timezone.utc).timestamp()}",
        "value": value,
        "currency": currency,
        "version": actual_version,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "metadata": metadata or {}
    }
    
    logger.info(
        "Minted new coin",
        extra={
            "coin_id": coin_data["id"],
            "value": value,
            "currency": currency,
            "version": actual_version
        }
    )
    
    return coin_data


class HeadyArchive:
    """
    Archive manager for preserving and retrieving Heady data.
    
    Attributes:
        archive_path: Path to the archive storage directory
        version: Version string for the archive format
    """
    
    def __init__(
        self,
        archive_path: Optional[str] = None,
        version: Optional[str] = None
    ):
        """
        Initialize the HeadyArchive.
        
        Args:
            archive_path: Path to archive directory (defaults to ./archive)
            version: Archive format version (defaults to environment variable or package version)
        """
        self.archive_path = Path(archive_path or os.getenv("ARCHIVE_PATH", "./archive"))
        self.archive_path.mkdir(parents=True, exist_ok=True)
        
        if version is None:
            version = os.getenv("HEADY_VERSION", "1.0.0")
        
        from . import __version__
        self.version = version or __version__
        
        logger.info(
            "Initialized HeadyArchive",
            extra={
                "archive_path": str(self.archive_path),
                "version": self.version
            }
        )
    
    def preserve(
        self,
        data: Dict[str, Any],
        identifier: Optional[str] = None
    ) -> str:
        """
        Preserve data to the archive.
        
        Args:
            data: Dictionary of data to preserve
            identifier: Optional custom identifier (generates timestamp-based if not provided)
            
        Returns:
            The identifier used for the archived data
            
        Raises:
            IOError: If writing to archive fails
        """
        if identifier is None:
            identifier = f"archive_{datetime.now(timezone.utc).timestamp()}"
        
        archive_file = self.archive_path / f"{identifier}.json"
        
        archive_entry = {
            "identifier": identifier,
            "version": self.version,
            "archived_at": datetime.now(timezone.utc).isoformat(),
            "data": data
        }
        
        try:
            with open(archive_file, 'w', encoding='utf-8') as f:
                json.dump(archive_entry, f, indent=2, ensure_ascii=False)
            
            logger.info(
                "Preserved data to archive",
                extra={
                    "identifier": identifier,
                    "file": str(archive_file),
                    "data_keys": list(data.keys())
                }
            )
            
            return identifier
            
        except IOError as e:
            logger.error(
                "Failed to preserve data",
                extra={"identifier": identifier, "error": str(e)}
            )
            raise
    
    def retrieve(self, identifier: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve data from the archive.
        
        Args:
            identifier: The identifier of the archived data
            
        Returns:
            The archived data dictionary, or None if not found
        """
        archive_file = self.archive_path / f"{identifier}.json"
        
        if not archive_file.exists():
            logger.warning(
                "Archive entry not found",
                extra={"identifier": identifier, "file": str(archive_file)}
            )
            return None
        
        try:
            with open(archive_file, 'r', encoding='utf-8') as f:
                archive_entry = json.load(f)
            
            logger.info(
                "Retrieved data from archive",
                extra={"identifier": identifier}
            )
            
            return archive_entry.get("data")
            
        except (IOError, json.JSONDecodeError) as e:
            logger.error(
                "Failed to retrieve data",
                extra={"identifier": identifier, "error": str(e)}
            )
            return None
    
    def list_archives(self) -> List[str]:
        """
        List all available archive identifiers.
        
        Returns:
            List of archive identifiers
        """
        archives = []
        
        for file in self.archive_path.glob("*.json"):
            identifier = file.stem
            archives.append(identifier)
        
        logger.info(
            "Listed archives",
            extra={"count": len(archives)}
        )
        
        return sorted(archives)
