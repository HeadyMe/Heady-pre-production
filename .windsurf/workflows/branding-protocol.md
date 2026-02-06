<!-- HEADY_BRAND:BEGIN -->
<!-- ╔══════════════════════════════════════════════════════════════════╗ -->
<!-- ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║ -->
<!-- ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║ -->
<!-- ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║ -->
<!-- ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║ -->
<!-- ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║ -->
<!-- ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║ -->
<!-- ║                                                                  ║ -->
<!-- ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║ -->
<!-- ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║ -->
<!-- ║  FILE: .windsurf/workflows/branding-protocol.md                   ║ -->
<!-- ║  LAYER: root                                                      ║ -->
<!-- ╚══════════════════════════════════════════════════════════════════╝ -->
<!-- HEADY_BRAND:END -->

---
description: Heady Sacred Geometry Branding Protocol — enforce colorful, heavily branded file headers across the entire project
---

# Heady Sacred Geometry Branding Protocol

## Goal
Every eligible source file carries a **heavy, colorful, visually striking** branded header using the Sacred Geometry block-letter ASCII art. The branding is enforced at three gates: **CLI**, **Git hook**, and **CI**.

## Banner Style
All branded files receive a box-drawn header with the full HEADY block-letter logo:
```
╔══════════════════════════════════════════════════════════════════╗
║  ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                     ║
║  ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                     ║
║  ███████║█████╗  ███████║██║  ██║ ╚████╔╝                      ║
║  ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                       ║
║  ██║  ██║███████╗██║  ██║██████╔╝   ██║                        ║
║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
║                                                                  ║
║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  FILE: <relative-path>                                          ║
║  LAYER: <layer>                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```
Wrapped in the appropriate comment syntax per file type (// for JS, # for Python/YAML/PS1, <!-- --> for Markdown).

## What Gets Branded
- **JavaScript/TypeScript:** `.js`, `.jsx`, `.ts`, `.tsx`, `.cjs`, `.mjs`
- **Python:** `.py`
- **PowerShell:** `.ps1`
- **Shell:** `.sh`
- **Markdown:** `.md`
- **YAML:** `.yml`, `.yaml`
- **Config (hash-comment):** `Dockerfile`, `.env*`, `.gitignore`, `.gitattributes`, `requirements.txt`, `docker-compose*.yml/.yaml`, `render.yml/.yaml`

## What Gets Skipped
- Binary/non-commentable: `.json`, `.lock`, `.ipynb`, `.png`, `.jpg`, `.gif`, `.pdf`, `.zip`, `.exe`
- Generated/minified: `*.min.js`, `*.map`
- Large files (> 1MB)
- Vendor/build dirs: `.git/`, `node_modules/`, `dist/`, `build/`, `venv/`, `__pycache__/`, `.pytest_cache/`

## Layer Mapping
Files are auto-tagged with a layer based on path:
- `public/` → `ui/public`
- `frontend/` → `ui/frontend`
- `backend/` → `backend`
- `src/` → `backend/src`
- `tests/` → `tests`
- `docs/` → `docs`
- Everything else → `root`

## Color Scheme (Terminal Output)
- **Cyan** — Box borders, headers, protocol names
- **Magenta** — HEADY block letters, agent counts
- **Green** — Success checkmarks, status dots
- **Yellow** — Warnings, ∞ Sacred Geometry tagline
- **Red** — Failures
- **Dim/Gray** — Skipped items, secondary info

## Steps

### 1. One-Time Retrofit (brand all existing files)
// turbo
```
npm run brand:fix
```

### 2. Check Without Writing
// turbo
```
npm run brand:check
```

### 3. Verbose Check (shows all files including already-branded)
// turbo
```
npm run brand:check -- --verbose
```

### 4. Install Git Pre-Commit Hook (auto-brands staged files)
```
npm run hooks:install
```
The hook runs `node scripts/brand_headers.js --fix --staged` before each commit.

### 5. CI Enforcement (GitHub Action)
Workflow: `.github/workflows/brand-headers.yml`
Runs `npm run brand:check` on every push/PR to `main`.

## Notes
- Branding is **idempotent** — existing blocks are replaced, never duplicated.
- Python shebang/encoding lines are preserved above the brand block.
- The branding script (`scripts/brand_headers.js`) outputs a colorful ANSI report with the HEADY banner.
- The `heady-manager.js` server prints a branded startup banner on boot.
- Standards reference: `.heady/branding.md`
