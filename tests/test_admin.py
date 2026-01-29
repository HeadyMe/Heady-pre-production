"""
Tests for admin_console.py script.

This module tests the admin console functionality.
"""

import json
import pytest
from pathlib import Path
import sys
from unittest.mock import Mock, patch

# Add parent directory to path to import admin console
sys.path.insert(0, str(Path(__file__).parent.parent))

from admin_console import HeadyAdminConsole


class TestHeadyAdminConsole:
    """Test cases for the HeadyAdminConsole class."""
    
    @pytest.fixture
    def temp_audit_log(self, tmp_path):
        """Create a temporary audit log path."""
        return tmp_path / "audit_test.jsonl"
    
    @pytest.fixture
    def console(self, temp_audit_log):
        """Create a HeadyAdminConsole instance for testing."""
        return HeadyAdminConsole(
            api_url="http://localhost:3300",
            api_key="test-key",
            audit_log_path=str(temp_audit_log)
        )
    
    def test_console_initialization(self, console):
        """Test console initialization."""
        assert console.api_url == "http://localhost:3300"
        assert console.api_key == "test-key"
        # Audit log directory should exist (parent directory)
        assert console.audit_log_path.parent.exists()
    
    def test_console_uses_env_vars(self, monkeypatch, tmp_path):
        """Test that console uses environment variables."""
        monkeypatch.setenv("HEADY_API_URL", "http://custom:8080")
        monkeypatch.setenv("HEADY_API_KEY", "custom-key")
        
        console = HeadyAdminConsole()
        
        assert console.api_url == "http://custom:8080"
        assert console.api_key == "custom-key"
    
    def test_audit_log_basic(self, console):
        """Test basic audit logging."""
        console.audit_log("test_event", {"detail": "value"})
        
        # Read the log file
        with open(console.audit_log_path, 'r') as f:
            line = f.readline()
            entry = json.loads(line)
        
        assert entry["event"] == "test_event"
        assert entry["details"]["detail"] == "value"
        assert "timestamp" in entry
    
    def test_audit_log_multiple_entries(self, console):
        """Test logging multiple audit entries."""
        console.audit_log("event1", {"id": 1})
        console.audit_log("event2", {"id": 2})
        console.audit_log("event3", {"id": 3})
        
        with open(console.audit_log_path, 'r') as f:
            lines = f.readlines()
        
        assert len(lines) == 3
        
        entries = [json.loads(line) for line in lines]
        assert entries[0]["details"]["id"] == 1
        assert entries[1]["details"]["id"] == 2
        assert entries[2]["details"]["id"] == 3
    
    def test_read_audit_log_empty(self, console):
        """Test reading from empty audit log."""
        entries = console.read_audit_log()
        
        assert entries == []
    
    def test_read_audit_log_with_data(self, console):
        """Test reading audit log with data."""
        console.audit_log("event1", {"data": 1})
        console.audit_log("event2", {"data": 2})
        
        entries = console.read_audit_log()
        
        assert len(entries) == 2
        assert entries[0]["event"] == "event1"
        assert entries[1]["event"] == "event2"
    
    def test_read_audit_log_with_limit(self, console):
        """Test reading audit log with limit."""
        for i in range(10):
            console.audit_log(f"event{i}", {"id": i})
        
        entries = console.read_audit_log(limit=5)
        
        assert len(entries) == 5
    
    def test_read_audit_log_with_filter(self, console):
        """Test reading audit log with event filter."""
        console.audit_log("login", {"user": "alice"})
        console.audit_log("logout", {"user": "bob"})
        console.audit_log("login", {"user": "charlie"})
        
        entries = console.read_audit_log(event_filter="login")
        
        assert len(entries) == 2
        assert all(e["event"] == "login" for e in entries)
    
    @patch('requests.get')
    def test_health_check_success(self, mock_get, console):
        """Test successful health check."""
        mock_response = Mock()
        mock_response.json.return_value = {
            "ok": True,
            "service": "heady-manager"
        }
        mock_get.return_value = mock_response
        
        result = console.health_check()
        
        assert result["ok"] is True
        assert result["service"] == "heady-manager"
        mock_get.assert_called_once()
    
    @patch('requests.get')
    def test_health_check_failure(self, mock_get, console):
        """Test health check failure."""
        mock_get.side_effect = Exception("Connection failed")
        
        result = console.health_check()
        
        assert result["ok"] is False
        assert "error" in result
    
    @patch('requests.get')
    def test_pulse_check_success(self, mock_get, console):
        """Test successful pulse check."""
        mock_response = Mock()
        mock_response.json.return_value = {
            "ok": True,
            "docker": {"ok": True}
        }
        mock_get.return_value = mock_response
        
        result = console.pulse_check()
        
        assert result["ok"] is True
        assert result["docker"]["ok"] is True
    
    def test_make_request_with_api_key(self, console):
        """Test that requests include API key header."""
        with patch('requests.get') as mock_get:
            mock_response = Mock()
            mock_response.json.return_value = {"ok": True}
            mock_get.return_value = mock_response
            
            console._make_request("/api/test")
            
            # Check that the API key was included in headers
            call_args = mock_get.call_args
            headers = call_args[1]['headers']
            assert headers['x-heady-api-key'] == "test-key"
