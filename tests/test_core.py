"""
Tests for heady_project.core module.

This module tests the core functionality including mint_coin() and HeadyArchive.
"""

import json
import os
import pytest
from pathlib import Path
from datetime import datetime
from heady_project import mint_coin, HeadyArchive


class TestMintCoin:
    """Test cases for the mint_coin function."""
    
    def test_mint_coin_basic(self):
        """Test basic coin minting with default parameters."""
        coin = mint_coin(100.0)
        
        assert coin["value"] == 100.0
        assert coin["currency"] == "USD"
        assert "id" in coin
        assert coin["id"].startswith("coin_")
        assert "created_at" in coin
        assert "version" in coin
        assert "metadata" in coin
    
    def test_mint_coin_with_currency(self):
        """Test coin minting with custom currency."""
        coin = mint_coin(50.0, "EUR")
        
        assert coin["value"] == 50.0
        assert coin["currency"] == "EUR"
    
    def test_mint_coin_with_metadata(self):
        """Test coin minting with custom metadata."""
        metadata = {"source": "payment", "user_id": "user123"}
        coin = mint_coin(75.0, metadata=metadata)
        
        assert coin["metadata"] == metadata
    
    def test_mint_coin_with_version(self):
        """Test coin minting with custom version."""
        coin = mint_coin(100.0, version="2.0.0")
        
        assert coin["version"] == "2.0.0"
    
    def test_mint_coin_uses_env_version(self, monkeypatch):
        """Test that mint_coin uses HEADY_VERSION from environment."""
        monkeypatch.setenv("HEADY_VERSION", "3.5.7")
        coin = mint_coin(100.0)
        
        assert coin["version"] == "3.5.7"
    
    def test_mint_coin_timestamp_format(self):
        """Test that created_at is in ISO format."""
        coin = mint_coin(100.0)
        
        # Should be parseable as datetime
        created_at = datetime.fromisoformat(coin["created_at"])
        assert isinstance(created_at, datetime)


class TestHeadyArchive:
    """Test cases for the HeadyArchive class."""
    
    @pytest.fixture
    def temp_archive_path(self, tmp_path):
        """Create a temporary archive path for testing."""
        return tmp_path / "test_archive"
    
    @pytest.fixture
    def archive(self, temp_archive_path):
        """Create a HeadyArchive instance for testing."""
        return HeadyArchive(archive_path=str(temp_archive_path))
    
    def test_archive_initialization(self, archive, temp_archive_path):
        """Test HeadyArchive initialization."""
        assert archive.archive_path == temp_archive_path
        assert temp_archive_path.exists()
        assert archive.version == "1.0.0"
    
    def test_archive_initialization_with_version(self, temp_archive_path):
        """Test HeadyArchive initialization with custom version."""
        archive = HeadyArchive(
            archive_path=str(temp_archive_path),
            version="2.5.0"
        )
        
        assert archive.version == "2.5.0"
    
    def test_preserve_basic(self, archive):
        """Test basic data preservation."""
        data = {"key": "value", "number": 42}
        identifier = archive.preserve(data)
        
        assert identifier is not None
        assert identifier.startswith("archive_")
        
        # Check file was created
        archive_file = archive.archive_path / f"{identifier}.json"
        assert archive_file.exists()
    
    def test_preserve_with_identifier(self, archive):
        """Test preservation with custom identifier."""
        data = {"test": "data"}
        identifier = archive.preserve(data, identifier="custom_id")
        
        assert identifier == "custom_id"
        
        archive_file = archive.archive_path / "custom_id.json"
        assert archive_file.exists()
    
    def test_preserve_and_retrieve(self, archive):
        """Test full preserve and retrieve cycle."""
        original_data = {
            "user": "alice",
            "action": "login",
            "timestamp": "2026-01-29T12:00:00"
        }
        
        identifier = archive.preserve(original_data)
        retrieved_data = archive.retrieve(identifier)
        
        assert retrieved_data == original_data
    
    def test_retrieve_nonexistent(self, archive):
        """Test retrieving non-existent archive."""
        result = archive.retrieve("nonexistent_id")
        
        assert result is None
    
    def test_preserve_file_structure(self, archive):
        """Test that preserved files have correct structure."""
        data = {"sample": "data"}
        identifier = archive.preserve(data, identifier="test_structure")
        
        archive_file = archive.archive_path / "test_structure.json"
        with open(archive_file, 'r') as f:
            content = json.load(f)
        
        assert "identifier" in content
        assert content["identifier"] == "test_structure"
        assert "version" in content
        assert "archived_at" in content
        assert "data" in content
        assert content["data"] == data
    
    def test_list_archives_empty(self, archive):
        """Test listing archives when empty."""
        archives = archive.list_archives()
        
        assert archives == []
    
    def test_list_archives_with_data(self, archive):
        """Test listing archives with multiple entries."""
        archive.preserve({"data": 1}, identifier="first")
        archive.preserve({"data": 2}, identifier="second")
        archive.preserve({"data": 3}, identifier="third")
        
        archives = archive.list_archives()
        
        assert len(archives) == 3
        assert "first" in archives
        assert "second" in archives
        assert "third" in archives
        assert archives == sorted(archives)  # Should be sorted
    
    def test_archive_uses_env_path(self, monkeypatch, tmp_path):
        """Test that archive uses ARCHIVE_PATH from environment."""
        env_path = tmp_path / "env_archive"
        monkeypatch.setenv("ARCHIVE_PATH", str(env_path))
        
        archive = HeadyArchive()
        
        assert archive.archive_path == env_path
        assert env_path.exists()
    
    def test_preserve_unicode_data(self, archive):
        """Test preserving data with Unicode characters."""
        data = {
            "text": "Hello 世界 🌍",
            "emoji": "🎉🚀💡"
        }
        
        identifier = archive.preserve(data)
        retrieved = archive.retrieve(identifier)
        
        assert retrieved == data
