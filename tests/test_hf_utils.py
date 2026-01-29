"""
Tests for Hugging Face utilities module.

This module tests the HF integration functionality including summarization,
question answering, and content generation.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from heady_project.hf_utils import HuggingFaceUtils, summarize_file


class TestHuggingFaceUtils:
    """Test cases for HuggingFaceUtils class."""
    
    @pytest.fixture
    def hf_utils(self):
        """Create HuggingFaceUtils instance for testing."""
        return HuggingFaceUtils()
    
    def test_initialization(self, hf_utils):
        """Test HuggingFaceUtils initialization."""
        assert hf_utils.cache_dir is None or isinstance(hf_utils.cache_dir, str)
        assert hf_utils._summarizer is None
        assert hf_utils._generator is None
        assert hf_utils._qa_pipeline is None
    
    def test_initialization_with_cache_dir(self, tmp_path):
        """Test initialization with custom cache directory."""
        cache_dir = str(tmp_path / "hf_cache")
        utils = HuggingFaceUtils(cache_dir=cache_dir)
        
        assert utils.cache_dir == cache_dir
    
    def test_initialization_with_token(self):
        """Test initialization with auth token."""
        utils = HuggingFaceUtils(use_auth_token="test_token")
        
        assert utils.use_auth_token == "test_token"
    
    @patch('heady_project.hf_utils.pipeline')
    def test_summarize_text_success(self, mock_pipeline, hf_utils):
        """Test successful text summarization."""
        # Mock the summarization pipeline
        mock_summarizer = Mock()
        mock_summarizer.return_value = [{"summary_text": "This is a summary."}]
        mock_pipeline.return_value = mock_summarizer
        
        text = "This is a long text that needs to be summarized. " * 10
        summary = hf_utils.summarize_text(text)
        
        assert summary == "This is a summary."
        mock_pipeline.assert_called_once()
    
    @patch('heady_project.hf_utils.pipeline')
    def test_summarize_text_truncation(self, mock_pipeline, hf_utils):
        """Test text truncation for long inputs."""
        mock_summarizer = Mock()
        mock_summarizer.return_value = [{"summary_text": "Summary"}]
        mock_pipeline.return_value = mock_summarizer
        
        # Very long text
        text = "A" * 2000
        summary = hf_utils.summarize_text(text)
        
        # Should truncate to max_input_length
        call_args = mock_summarizer.call_args[0][0]
        assert len(call_args) <= 1024
    
    @patch('heady_project.hf_utils.pipeline')
    def test_summarize_text_fallback(self, mock_pipeline, hf_utils):
        """Test fallback behavior when summarization fails."""
        mock_pipeline.side_effect = Exception("Model not found")
        
        text = "This is test text." * 20
        summary = hf_utils.summarize_text(text)
        
        # Should fallback to simple truncation
        assert summary.endswith("...")
        assert len(summary) <= 153  # max_length + "..."
    
    @patch('heady_project.hf_utils.pipeline')
    def test_summarize_build_log(self, mock_pipeline, hf_utils):
        """Test build log summarization."""
        mock_summarizer = Mock()
        mock_summarizer.return_value = [{"summary_text": "Build completed successfully"}]
        mock_pipeline.return_value = mock_summarizer
        
        log_content = """
        INFO: Building project
        WARNING: Deprecated API used
        ERROR: Test failed
        INFO: Build completed with 1 error
        """
        
        result = hf_utils.summarize_build_log(log_content)
        
        assert "summary" in result
        assert result["errors"] == 1
        assert result["warnings"] == 1
        assert isinstance(result["success"], bool)
        assert result["length"] == len(log_content)
    
    @patch('heady_project.hf_utils.pipeline')
    def test_generate_docstring(self, mock_pipeline, hf_utils):
        """Test docstring generation."""
        mock_generator = Mock()
        mock_generator.return_value = [{
            "generated_text": "prompt text\nDocstring:\nGenerate summary of data"
        }]
        mock_pipeline.return_value = mock_generator
        
        signature = "def process_data(data):"
        body = "    return data.sum()"
        
        docstring = hf_utils.generate_docstring(signature, body)
        
        assert "Generate summary of data" in docstring
    
    @patch('heady_project.hf_utils.pipeline')
    def test_generate_docstring_fallback(self, mock_pipeline, hf_utils):
        """Test docstring generation fallback."""
        mock_pipeline.side_effect = Exception("Model error")
        
        signature = "def test():"
        body = "    pass"
        
        docstring = hf_utils.generate_docstring(signature, body)
        
        assert "TODO" in docstring
    
    @patch('heady_project.hf_utils.pipeline')
    def test_answer_question_success(self, mock_pipeline, hf_utils):
        """Test successful question answering."""
        mock_qa = Mock()
        mock_qa.return_value = {
            "answer": "Run pytest tests/",
            "score": 0.95,
            "start": 10,
            "end": 25
        }
        mock_pipeline.return_value = mock_qa
        
        question = "How do I run tests?"
        context = "To run tests, execute: pytest tests/"
        
        result = hf_utils.answer_question(question, context)
        
        assert result["answer"] == "Run pytest tests/"
        assert result["score"] == 0.95
    
    @patch('heady_project.hf_utils.pipeline')
    def test_answer_question_failure(self, mock_pipeline, hf_utils):
        """Test question answering failure handling."""
        mock_pipeline.side_effect = Exception("Model error")
        
        result = hf_utils.answer_question("Question?", "Context")
        
        assert result["score"] == 0.0
        assert "couldn't find" in result["answer"].lower()
    
    @patch('heady_project.hf_utils.pipeline')
    def test_generate_release_notes(self, mock_pipeline, hf_utils):
        """Test release notes generation."""
        mock_generator = Mock()
        mock_generator.return_value = [{
            "generated_text": "prompt\nRelease Notes:\nVersion 1.0 includes new features"
        }]
        mock_pipeline.return_value = mock_generator
        
        commits = [
            "Add feature X",
            "Fix bug Y",
            "Update documentation"
        ]
        
        notes = hf_utils.generate_release_notes(commits)
        
        assert "Version 1.0" in notes or "feature" in notes.lower()
    
    @patch('heady_project.hf_utils.pipeline')
    def test_generate_release_notes_fallback(self, mock_pipeline, hf_utils):
        """Test release notes generation fallback."""
        mock_pipeline.side_effect = Exception("Model error")
        
        commits = ["Commit 1", "Commit 2"]
        notes = hf_utils.generate_release_notes(commits)
        
        assert "Release Notes:" in notes
        assert "Commit 1" in notes


class TestSummarizeFile:
    """Test cases for summarize_file function."""
    
    @patch('heady_project.hf_utils.HuggingFaceUtils')
    def test_summarize_file_success(self, mock_utils_class, tmp_path):
        """Test successful file summarization."""
        # Create test file
        test_file = tmp_path / "test.txt"
        test_file.write_text("This is test content that needs summarization.")
        
        # Mock the utils
        mock_utils = Mock()
        mock_utils.summarize_text.return_value = "Summary of content"
        mock_utils_class.return_value = mock_utils
        
        result = summarize_file(str(test_file))
        
        assert result == "Summary of content"
        mock_utils.summarize_text.assert_called_once()
    
    def test_summarize_file_not_found(self):
        """Test file not found error handling."""
        result = summarize_file("/nonexistent/file.txt")
        
        assert "Failed to summarize" in result


class TestEnvironmentVariableConfiguration:
    """Test environment variable configuration."""
    
    def test_custom_summarization_model(self, monkeypatch):
        """Test custom summarization model via env var."""
        monkeypatch.setenv("HF_SUMMARIZATION_MODEL", "custom-model")
        
        # Re-import to pick up env var
        import importlib
        from heady_project import hf_utils
        importlib.reload(hf_utils)
        
        assert hf_utils.DEFAULT_SUMMARIZATION_MODEL == "custom-model"
    
    def test_custom_cache_dir(self, monkeypatch, tmp_path):
        """Test custom cache directory via env var."""
        cache_dir = str(tmp_path / "custom_cache")
        monkeypatch.setenv("HF_CACHE_DIR", cache_dir)
        
        utils = HuggingFaceUtils()
        
        assert utils.cache_dir == cache_dir
