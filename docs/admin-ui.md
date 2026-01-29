# Admin UI (Planned) Runbook - Quiz Protocol

Status: Planned. This document captures the intended setup and operation for the upcoming Admin UI.

## Review & Extract
- Components: heady-manager (Node/Express API), Admin UI (React + Monaco editor), Python build/audit tools (admin_console.py, consolidated_builder.py).
- Paths: repo root, HeadySystems/heady_project (target code roots), public/admin (static build output).
- APIs: /api/admin/files, /api/admin/file, /api/admin/build, /api/admin/audit, /api/admin/ops/{id}/stream, /api/admin/assistant.
- Security: HEADY_API_KEY auth, allowlisted paths, server-side secrets.
- Local setup: install Node deps, Python deps, start heady-manager, start admin-ui dev server.
- Production setup: render.yaml runs heady-manager; add admin-ui build step and env vars.

## Quiz Questions
### Local setup
1. Q: What commands install Node dependencies for the admin API and UI?
2. Q: How do you start the heady-manager API?
3. Q: What URL serves the Admin UI after build?
4. Q: How do you install Python deps for build/audit tooling?

### Configuration and security
1. Q: Which env var protects admin endpoints?
2. Q: Which env vars define the repo roots that can be accessed?
3. Q: How are secrets (DATABASE_URL, tokens) exposed to the UI?

### Operations and monitoring
1. Q: Which endpoints trigger build and audit runs?
2. Q: How are build/audit logs streamed to the UI?

### Production
1. Q: What changes are required in render.yaml to include Admin UI assets?
2. Q: Which env group supplies secrets in production?

## Flashcards
### Local setup
Q: What commands install Node dependencies for the admin API and UI?
A: From repo root run `npm install` for heady-manager, then in the admin UI folder run `npm install` (planned path: admin-ui/).

Q: How do you start the heady-manager API?
A: Set HEADY_API_KEY (and optional HEADY_CORS_ORIGINS/HEADY_PYTHON_BIN), then run `npm start`; the server listens on port 3300 by default.

Q: What URL serves the Admin UI after build?
A: The planned static build output is `public/admin`, served by heady-manager at `/admin`.

Q: How do you install Python deps for build/audit tooling?
A: Create a venv and run `pip install -r requirements.txt` to provide the Python worker dependencies.

### Configuration and security
Q: Which env var protects admin endpoints?
A: HEADY_API_KEY; the Admin UI should pass it via `x-heady-api-key` or Bearer token.

Q: Which env vars define the repo roots that can be accessed?
A: Planned: HEADY_ADMIN_ROOT and HEADY_ADMIN_ALLOWED_PATHS (comma-separated allowlist).

Q: How are secrets exposed to the UI?
A: They are not; secrets remain on the server. The UI only receives redacted metadata and operation results.

### Operations and monitoring
Q: Which endpoints trigger build and audit runs?
A: Planned: POST /api/admin/build and POST /api/admin/audit with a target path and options.

Q: How are build/audit logs streamed to the UI?
A: Planned: Server-Sent Events from /api/admin/ops/{id}/stream with structured progress payloads.

### Production
Q: What changes are required in render.yaml to include Admin UI assets?
A: Add an admin UI build step (e.g., `npm --prefix admin-ui run build`) before starting heady-manager so `public/admin` is available.

Q: Which env group supplies secrets in production?
A: The Render env group `heady-shared-secrets` referenced in render.yaml.

## Precision Check
- Verify HEADY_API_KEY is set before running admin endpoints.
- Confirm HEADY_ADMIN_ROOT and allowlist are set to the intended repo paths.
- Ensure the admin UI build output is present under public/admin before production start.
