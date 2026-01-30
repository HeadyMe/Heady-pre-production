# Contributing to Heady

We welcome contributions! Follow these steps to get started.

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
3. Set required environment variables (see README.md)
4. Start the development server:
   ```bash
   npm start
   ```
5. Open the Admin IDE at http://localhost:3300/admin

## Code Style

- **Node.js:** ES6+, async/await, Express middleware patterns
- **Python:** PEP 8, type hints encouraged, descriptive variable names
- **React:** Functional components, hooks, inline styles for single-file apps
- **Comments:** Minimal but meaningful; code should be self-documenting

## Documentation Protocol

All documentation MUST follow the **Quiz & Flashcard Methodology** (see `.github/copilot-instructions.md`).

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (use clear, imperative messages)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

- Ensure all existing tests pass
- Add tests for new features
- Verify the Admin IDE loads and functions correctly

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
