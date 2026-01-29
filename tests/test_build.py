"""
Tests for build scripts (execute_build.py and consolidated_builder.py).

This module tests the build automation functionality.
"""

import json
import pytest
from pathlib import Path
import sys
import os

# Add parent directory to path to import build scripts
sys.path.insert(0, str(Path(__file__).parent.parent))

from execute_build import load_config, build_project
from consolidated_builder import load_projects_config, validate_project, build_single_project


class TestExecuteBuild:
    """Test cases for execute_build.py script."""
    
    @pytest.fixture
    def sample_config(self, tmp_path):
        """Create a sample build configuration."""
        config = {
            "project_path": str(tmp_path),
            "build_commands": [
                ["echo", "Building project"]
            ]
        }
        
        config_file = tmp_path / "build_config.json"
        with open(config_file, 'w') as f:
            json.dump(config, f)
        
        return str(config_file)
    
    def test_load_config_success(self, sample_config):
        """Test loading a valid configuration file."""
        config = load_config(sample_config)
        
        assert "project_path" in config
        assert "build_commands" in config
    
    def test_load_config_missing_file(self, tmp_path):
        """Test loading a non-existent configuration file."""
        with pytest.raises(FileNotFoundError):
            load_config(str(tmp_path / "nonexistent.json"))
    
    def test_load_config_invalid_json(self, tmp_path):
        """Test loading an invalid JSON file."""
        invalid_file = tmp_path / "invalid.json"
        invalid_file.write_text("{invalid json")
        
        with pytest.raises(json.JSONDecodeError):
            load_config(str(invalid_file))


class TestConsolidatedBuilder:
    """Test cases for consolidated_builder.py script."""
    
    @pytest.fixture
    def sample_projects_config(self, tmp_path):
        """Create a sample projects configuration."""
        project_dir = tmp_path / "project1"
        project_dir.mkdir()
        
        config = {
            "projects": {
                "project1": {
                    "path": str(project_dir),
                    "build_command": ["echo", "Building project1"]
                }
            }
        }
        
        config_file = tmp_path / "projects.json"
        with open(config_file, 'w') as f:
            json.dump(config, f)
        
        return str(config_file)
    
    def test_load_projects_config_success(self, sample_projects_config):
        """Test loading a valid projects configuration."""
        config = load_projects_config(sample_projects_config)
        
        assert "projects" in config
        assert "project1" in config["projects"]
    
    def test_load_projects_config_missing_file(self, tmp_path):
        """Test loading a non-existent projects file."""
        with pytest.raises(FileNotFoundError):
            load_projects_config(str(tmp_path / "nonexistent.json"))
    
    def test_validate_project_success(self, tmp_path):
        """Test validating a valid project configuration."""
        project_dir = tmp_path / "valid_project"
        project_dir.mkdir()
        
        project = {
            "path": str(project_dir),
            "build_command": ["echo", "test"]
        }
        
        assert validate_project(project, "valid_project") is True
    
    def test_validate_project_missing_path(self):
        """Test validating a project with missing path."""
        project = {
            "build_command": ["echo", "test"]
        }
        
        assert validate_project(project, "invalid") is False
    
    def test_validate_project_missing_build_command(self, tmp_path):
        """Test validating a project with missing build command."""
        project = {
            "path": str(tmp_path)
        }
        
        assert validate_project(project, "invalid") is False
    
    def test_validate_project_nonexistent_path(self):
        """Test validating a project with non-existent path."""
        project = {
            "path": "/nonexistent/path",
            "build_command": ["echo", "test"]
        }
        
        assert validate_project(project, "invalid") is False
    
    def test_build_single_project_success(self, tmp_path):
        """Test building a single project successfully."""
        project_dir = tmp_path / "test_project"
        project_dir.mkdir()
        
        project_config = {
            "path": str(project_dir),
            "build_command": ["echo", "Building"]
        }
        
        result = build_single_project("test_project", project_config)
        
        assert result is True
    
    def test_build_single_project_with_version(self, tmp_path):
        """Test building a project with custom version."""
        project_dir = tmp_path / "test_project"
        project_dir.mkdir()
        
        project_config = {
            "path": str(project_dir),
            "build_command": ["echo", "Building"],
            "env": {}
        }
        
        result = build_single_project("test_project", project_config, version="2.0.0")
        
        assert result is True
