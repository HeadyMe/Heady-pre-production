# Contributing to Heady

Thank you for your interest in contributing to Heady! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- **Python 3.8+** for backend development
- **Node.js 18+** for the API server
- **Git** for version control
- **PostgreSQL** (optional, for database features)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Heady.git
   cd Heady
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/HeadyMe/Heady.git
   ```

## Development Setup

### Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -e ".[dev]"
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# Required
HEADY_API_KEY=your-development-api-key
HF_TOKEN=your-huggingface-token

# Optional
DATABASE_URL=postgresql://localhost:5432/heady_dev
HF_TEXT_MODEL=gpt2
HF_SUMMARIZATION_MODEL=facebook/bart-large-cnn
```

### Verify Setup

```bash
# Run tests to verify everything works
pytest tests/ -v

# Start the API server
node heady-manager.js
```

## Making Changes

### Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### Write Quality Code

1. **Follow the coding standards** (see below)
2. **Write tests** for new functionality
3. **Update documentation** when changing behavior
4. **Keep commits focused** - one logical change per commit

## Testing

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_core.py -v

# Run with coverage
pytest tests/ --cov=heady_project --cov-report=html

# Run integration tests
pytest tests/test_integration.py -v
```

### Writing Tests

- Place tests in the `tests/` directory
- Name test files `test_*.py`
- Use descriptive test names: `test_mint_coin_with_metadata`
- Include docstrings explaining what the test validates
- Use fixtures for common setup
- Mock external services (Hugging Face API, etc.)

Example:
```python
def test_summarize_text_success(self, hf_utils):
    """Test successful text summarization."""
    text = "Long text to summarize..."
    summary = hf_utils.summarize_text(text)
    
    assert len(summary) < len(text)
    assert summary is not None
```

## Submitting Changes

### Before Submitting

1. **Run tests**: `pytest tests/ -v`
2. **Run linters**:
   ```bash
   black heady_project/ *.py
   flake8 heady_project/ *.py --max-line-length=100
   mypy heady_project/
   ```
3. **Update documentation** if needed
4. **Write a good commit message** (see below)

### Commit Messages

Follow the conventional commit format:

```
<type>: <subject>

<body>

<footer>
```

**Type** should be one of:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example**:
```
feat: Add AI-powered log summarization

Implement HuggingFaceUtils class with summarization pipeline
for automatically generating concise summaries of build logs
and audit trails.

- Add lazy-loading of HF models for memory efficiency
- Support configurable models via environment variables
- Include fallback behavior when models unavailable

Closes #123
```

### Pull Request Process

1. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to related issues
   - Screenshots for UI changes

3. **Address review feedback** promptly

4. **Keep your PR updated** with the main branch:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Coding Standards

### Python

- **PEP 8** compliance with 100-character line length
- **Type hints** on all function signatures
- **Docstrings** using Google style:
  ```python
  def function_name(arg1: str, arg2: int) -> bool:
      """
      Brief description of function.
      
      Args:
          arg1: Description of arg1
          arg2: Description of arg2
          
      Returns:
          Description of return value
          
      Raises:
          ValueError: When validation fails
      """
  ```
- **Logging** instead of print statements
- **Structured error handling** with specific exceptions

### JavaScript

- **ES6+** features preferred
- **async/await** over callbacks
- **Const/let** instead of var
- **Error handling** in async routes
- **Environment variables** with defaults

### General

- **No hardcoded secrets** - use environment variables
- **Parameterize configuration** - avoid magic numbers
- **DRY principle** - don't repeat yourself
- **SOLID principles** - especially Single Responsibility
- **Meaningful names** - variables, functions, classes

## Community

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Documentation**: Check the README and inline docs first

### Reporting Bugs

Use the bug report template and include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Python/Node version)
- Relevant logs or screenshots

### Suggesting Features

Use the feature request template and explain:
- The problem you're trying to solve
- Your proposed solution
- Alternative solutions considered
- Why this benefits other users

## License

By contributing to Heady, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for contributing to Heady!** Your efforts help make this project better for everyone.
