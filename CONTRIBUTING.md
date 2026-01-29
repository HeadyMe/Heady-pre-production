# Contributing to Heady Systems

First off, thank you for considering contributing to Heady! It's people like you that make Heady such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- Python 3.11+
- Git
- A GitHub account
- Docker (optional, for testing Docker-related features)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/Heady.git
   cd Heady
   ```

3. **Add the upstream repository:**
   ```bash
   git remote add upstream https://github.com/HeadyMe/Heady.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Create a `.env` file** with required environment variables (see README.md)

6. **Verify your setup:**
   ```bash
   npm start  # Should start the server without errors
   python src/process_data.py  # Should initialize the worker
   ```

## 🔄 Development Process

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Workflow

1. **Create a new branch** from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly

4. **Commit your changes** using descriptive commit messages:
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** on GitHub

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows our coding standards
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated (README, inline comments, etc.)
- [ ] No merge conflicts with `main`
- [ ] Commit messages follow conventional commits format

### PR Template

When opening a PR, include:

**Title:** `[Type] Brief description` (e.g., `[Feature] Add GPU compute offloading`)

**Description:**
```markdown
## Changes
- Describe what you changed
- Why you changed it
- Any breaking changes

## Testing
- How you tested the changes
- Test cases added/modified

## Screenshots
(If applicable)

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. At least one maintainer review required
2. All CI checks must pass
3. No merge conflicts
4. Maintainer will merge or request changes

## 💻 Coding Standards

### JavaScript/Node.js

```javascript
// Use ES6+ features
const myFunction = async (param) => {
  // Clear, descriptive variable names
  const processedData = await processData(param);
  return processedData;
};

// Avoid magic numbers
const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000;

// Use destructuring
const { name, age } = user;

// Error handling
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error.message);
  throw error;
}
```

### Python

```python
"""Module docstring describing purpose."""
from typing import Optional, Dict, Any

def process_data(input_data: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Process input data with optional configuration.
    
    Args:
        input_data: The data to process
        options: Optional configuration dictionary
        
    Returns:
        Dictionary with processed results
        
    Raises:
        ValueError: If input_data is invalid
    """
    if not input_data:
        raise ValueError("input_data cannot be empty")
    
    # Use descriptive variable names
    processed_result = {
        "status": "success",
        "data": input_data.upper()
    }
    
    return processed_result
```

### General Guidelines

- **Descriptive names:** `calculateUserAge()` not `calc()`
- **Single responsibility:** Functions should do one thing well
- **DRY principle:** Don't Repeat Yourself
- **Comments:** Explain *why*, not *what* (code should be self-documenting)
- **Error handling:** Always handle errors gracefully
- **Security:** Never commit secrets or API keys

### File Organization

```
src/
├── utils/           # Utility functions
├── models/          # Data models
├── services/        # Business logic
└── tests/           # Test files
```

## 🧪 Testing Guidelines

### Writing Tests

```javascript
// JavaScript tests (when added)
describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction(input);
    expect(result).toBe(expectedValue);
  });
  
  it('should handle errors gracefully', () => {
    expect(() => myFunction(invalidInput)).toThrow();
  });
});
```

```python
# Python tests (when added)
import unittest

class TestProcessData(unittest.TestCase):
    def test_valid_input(self):
        result = process_data("test")
        self.assertEqual(result["status"], "success")
    
    def test_invalid_input(self):
        with self.assertRaises(ValueError):
            process_data("")
```

### Test Coverage

- Aim for >80% code coverage
- Test edge cases and error conditions
- Include integration tests for API endpoints

### Running Tests

```bash
# Python syntax check
python -m compileall src

# Run tests (when implemented)
npm test
pytest
```

## 📚 Documentation

### Code Documentation

- **Functions/Methods:** Include docstrings/JSDoc
- **Complex logic:** Add inline comments explaining *why*
- **API changes:** Update README.md and API documentation

### Documentation Updates

When contributing:
1. Update README.md if you change functionality
2. Update inline code comments
3. Add examples for new features
4. Follow the **Quiz & Flashcard Methodology** (see `.github/copilot-instructions.md`)

### Quiz & Flashcard Methodology

When documenting new features, create documentation as Q&A pairs:

**Q: What does the GPU offloading feature do?**
**A: Allows compute-intensive tasks to be offloaded to remote GPU servers using Nvidia GPUDirect RDMA for 10× better performance.**

**Q: How do I enable GPU offloading?**
**A: Set `ENABLE_GPUDIRECT=true` and configure `GPU_ENDPOINT` in your environment variables.**

## 🌟 Types of Contributions

### 🐛 Bug Reports

Use the issue template and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node/Python versions)
- Error messages/logs

### ✨ Feature Requests

Include:
- Problem statement (what pain point does it solve?)
- Proposed solution
- Alternatives considered
- Implementation ideas (optional)

### 📝 Documentation

- Fix typos
- Clarify confusing sections
- Add examples
- Improve structure

### 🔧 Code Contributions

- Bug fixes
- New features
- Performance improvements
- Refactoring

## 👥 Community

### Getting Help

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues for bugs
- 📧 Email maintainers for security issues

### Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes
- Special mentions for significant contributions

## 🎯 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code style (formatting, semicolons, etc.)
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` Performance improvement
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```bash
feat(api): add GPU offloading endpoint
fix(auth): resolve API key validation issue
docs(readme): update installation instructions
refactor(utils): simplify error handling logic
```

## 🏆 What Makes a Good Contribution?

- ✅ Solves a real problem
- ✅ Well-tested
- ✅ Documented
- ✅ Follows coding standards
- ✅ Has clear commit messages
- ✅ Minimal scope (focused changes)
- ✅ No breaking changes (or well-documented)

## ❓ Questions?

Don't hesitate to ask! We're here to help:
- Open a discussion on GitHub
- Comment on relevant issues
- Reach out to maintainers

---

**Thank you for contributing to Heady Systems! ∞**
