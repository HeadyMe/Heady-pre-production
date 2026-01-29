"""
Test configuration and fixtures for pytest.
"""

import pytest
import os


@pytest.fixture(autouse=True)
def clean_environment(monkeypatch):
    """
    Clean environment variables before each test.
    
    This ensures tests don't interfere with each other via env vars.
    """
    # Remove common env vars that might affect tests
    env_vars_to_remove = [
        "HEADY_VERSION",
        "HEADY_API_URL",
        "HEADY_API_KEY",
        "DATABASE_URL",
        "ARCHIVE_PATH",
        "AUDIT_LOG_PATH"
    ]
    
    for var in env_vars_to_remove:
        monkeypatch.delenv(var, raising=False)


@pytest.fixture
def sample_env_vars(monkeypatch):
    """
    Set up sample environment variables for testing.
    """
    monkeypatch.setenv("HEADY_VERSION", "1.0.0")
    monkeypatch.setenv("HEADY_API_KEY", "test-api-key-12345")
    monkeypatch.setenv("DATABASE_URL", "postgresql://test:test@localhost:5432/test_db")
    
    return {
        "HEADY_VERSION": "1.0.0",
        "HEADY_API_KEY": "test-api-key-12345",
        "DATABASE_URL": "postgresql://test:test@localhost:5432/test_db"
    }
