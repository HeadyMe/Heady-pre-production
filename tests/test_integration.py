"""
Integration tests for the Heady system.

Tests the interaction between different components.
"""

import json
import pytest
import sys
from pathlib import Path
from unittest.mock import patch, Mock

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from heady_project import mint_coin, HeadyArchive
from admin_console import HeadyAdminConsole


class TestEndToEndWorkflow:
    """Test complete end-to-end workflows."""
    
    @pytest.fixture
    def temp_paths(self, tmp_path):
        """Create temporary paths for testing."""
        return {
            "archive": tmp_path / "archive",
            "audit": tmp_path / "audit.jsonl"
        }
    
    def test_coin_minting_and_archiving(self, temp_paths):
        """Test minting coins and archiving them."""
        # Mint a coin
        coin = mint_coin(
            100.0,
            "USD",
            metadata={"source": "test_payment"}
        )
        
        # Archive the coin
        archive = HeadyArchive(archive_path=str(temp_paths["archive"]))
        identifier = archive.preserve(coin, identifier="coin_archive")
        
        # Retrieve and verify
        retrieved_coin = archive.retrieve(identifier)
        
        assert retrieved_coin["value"] == 100.0
        assert retrieved_coin["currency"] == "USD"
        assert retrieved_coin["metadata"]["source"] == "test_payment"
    
    def test_admin_console_with_archiving(self, temp_paths):
        """Test admin console with archive operations."""
        # Create admin console
        console = HeadyAdminConsole(
            audit_log_path=str(temp_paths["audit"])
        )
        
        # Perform some operations and log them
        archive = HeadyArchive(archive_path=str(temp_paths["archive"]))
        
        # Mint and archive coins
        for i in range(5):
            coin = mint_coin(i * 10.0, metadata={"index": i})
            identifier = archive.preserve(coin)
            
            console.audit_log("coin_created", {
                "coin_id": coin["id"],
                "identifier": identifier,
                "value": coin["value"]
            })
        
        # Read audit log
        audit_entries = console.read_audit_log()
        
        assert len(audit_entries) == 5
        assert all(e["event"] == "coin_created" for e in audit_entries)
        
        # Verify archives
        archives = archive.list_archives()
        assert len(archives) == 5
    
    @patch('requests.get')
    def test_admin_monitoring_workflow(self, mock_get, temp_paths):
        """Test admin console monitoring workflow."""
        # Mock API responses
        mock_response = Mock()
        mock_response.json.return_value = {
            "ok": True,
            "service": "heady-manager",
            "uptime_s": 3600
        }
        mock_get.return_value = mock_response
        
        # Create console
        console = HeadyAdminConsole(
            api_url="http://localhost:3300",
            api_key="test-key",
            audit_log_path=str(temp_paths["audit"])
        )
        
        # Perform health check
        health = console.health_check()
        assert health["ok"] is True
        
        # Should have logged the check
        # (The health_check method doesn't log, but we can add that)
        
    def test_build_and_archive_workflow(self, temp_paths):
        """Test building projects and archiving results."""
        archive = HeadyArchive(archive_path=str(temp_paths["archive"]))
        
        # Simulate build results
        build_results = {
            "project1": {"status": "success", "time": 42},
            "project2": {"status": "success", "time": 38},
            "project3": {"status": "failed", "error": "test error"}
        }
        
        # Archive each result
        for project, result in build_results.items():
            identifier = archive.preserve(
                result,
                identifier=f"build_{project}"
            )
            assert identifier is not None
        
        # Retrieve and verify
        project1_result = archive.retrieve("build_project1")
        assert project1_result["status"] == "success"
        assert project1_result["time"] == 42
        
        project3_result = archive.retrieve("build_project3")
        assert project3_result["status"] == "failed"


class TestConfigurationIntegration:
    """Test configuration file integration."""
    
    def test_projects_json_structure(self):
        """Test that projects.json has valid structure."""
        projects_file = Path(__file__).parent.parent / "projects.json"
        
        if not projects_file.exists():
            pytest.skip("projects.json not found")
        
        with open(projects_file, 'r') as f:
            config = json.load(f)
        
        assert "projects" in config
        assert isinstance(config["projects"], dict)
        
        for project_name, project_config in config["projects"].items():
            assert "path" in project_config
            assert "build_command" in project_config
    
    def test_mcp_config_structure(self):
        """Test that mcp_config.json has valid structure."""
        mcp_file = Path(__file__).parent.parent / "mcp_config.json"
        
        if not mcp_file.exists():
            pytest.skip("mcp_config.json not found")
        
        with open(mcp_file, 'r') as f:
            config = json.load(f)
        
        assert "mcpServers" in config
        
        for server_name, server_config in config["mcpServers"].items():
            assert "command" in server_config
            assert "args" in server_config
            # Optional: description and env
