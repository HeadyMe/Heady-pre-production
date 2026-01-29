# HeadySystems Copilot Instructions

## Project Overview

This is a **Hybrid Node.js/Python** system designed for the HeadyConnection ecosystem.

- **Manager Layer:** Node.js with MCP Protocol (`heady-manager.js`)
- **Worker Layer:** Python data processing (`src/process_data.py`)
- **Frontend:** Single-file React application with Sacred Geometry aesthetics
- **Deployment:** Render.com Blueprint with managed Postgres

## Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| `heady-manager.js` | Node.js/Express | MCP server, API endpoints, static file serving |
| `src/process_data.py` | Python | Background data processing worker |
| `public/index.html` | React (CDN) | Sacred Geometry UI dashboard |
| `render.yaml` | Render Blueprint | Infrastructure-as-code deployment |

## Documentation Protocol

**CRITICAL:** All documentation MUST be generated using the **Quiz & Flashcard Methodology**.

### The Quiz Protocol

When asked to document code or generate summaries, follow this exact procedure:

1. **Review & Extract**
   - Read the material thoroughly
   - Identify key concepts, processes, and data structures

2. **Generate Quiz Questions**
   - Create clear questions for each concept
   - Use open-ended questions for insights and understanding
   - Use boolean/multiple-choice for factual recall

3. **Formulate Flashcards**
   - Convert Question-Answer pairs into flashcards
   - ONE idea per card
   - Keep answers concise but complete

4. **Iterative Coverage**
   - Repeat until all material is processed
   - Avoid redundancy across cards

5. **Integrate & Organize**
   - Group cards under logical headings (Architecture, APIs, Data Flow)
   - Maintain consistent formatting

6. **Ensure Precision**
   - Verify technical accuracy
   - Cross-reference with source code

## Code Style Guidelines

- **Node.js:** ES6+, async/await, Express middleware patterns
- **Python:** PEP 8, type hints encouraged, descriptive variable names
- **React:** Functional components, hooks, inline styles for single-file apps
- **Comments:** Minimal but meaningful; code should be self-documenting

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Serves Sacred Geometry UI |
| `/api/pulse` | GET | System status and Docker info |
| `/api/health` | GET | Simple health check |

## Environment Variables

Managed via Render's `heady-shared-secrets` env group:
- `DATABASE_URL` - Postgres connection string
- `HEADY_API_KEY` - Auto-generated API key
