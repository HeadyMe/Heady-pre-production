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
description: Heady Sacred Geometry Branding Protocol — cloud-only branding validation and governance
---

# Heady Sacred Geometry Branding Protocol

## Goal
Every eligible source file carries a **heavy, colorful, visually striking** branded header using the Sacred Geometry block-letter ASCII art. Branding validation is managed through cloud orchestration and status APIs.

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
Wrapped in the appropriate comment syntax per file type (// for JS, # for Python/YAML, <!-- --> for Markdown).

## What Gets Branded
- **JavaScript/TypeScript:** `.js`, `.jsx`, `.ts`, `.tsx`, `.cjs`, `.mjs`
- **Python:** `.py`
- **Shell:** `.sh`
- **Markdown:** `.md`
- **YAML:** `.yml`, `.yaml`
- **Config (hash-comment):** `Dockerfile`, `.env*`, `.gitignore`, `.gitattributes`, `requirements.txt`, `render.yml/.yaml`

## What Gets Skipped
- Binary/non-commentable: `.json`, `.lock`, `.ipynb`, `.png`, `.jpg`, `.gif`, `.pdf`, `.zip`, `.exe`
- Generated/minified: `*.min.js`, `*.map`
- Large files (> 1MB)
- Vendor/build directories managed outside cloud pipeline scope

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

### 1. Trigger cloud branding validation run
// turbo
```bash
curl -sf -X POST https://headycloud.com/api/pipeline/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"pipeline":"autobuild"}'
```

### 2. Analyze branding coverage across source paths
// turbo
```bash
curl -sf -X POST https://headysystems.com/api/pipeline/claude/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HEADY_API_KEY" \
  -d '{"paths":["src/","docs/","scripts/"]}'
```

### 3. Check pipeline and system readiness
// turbo
```bash
curl -sf https://headycloud.com/api/pipeline/state \
  -H "Authorization: Bearer $HEADY_API_KEY"
curl -sf https://headysystems.com/api/system/status
```

### 4. Verify generated site/status signals
// turbo
```bash
curl -sf https://headysystems.com/api/v1/sites/status
curl -sf https://headysystems.com/api/health
```

### 5. CI Enforcement
Branding checks are included in cloud pipeline governance and should be verified from pipeline state and history endpoints.

## Notes
- Branding is **idempotent** — existing blocks are replaced, never duplicated.
- Python shebang/encoding lines are preserved above the brand block.
- Cloud pipeline runs should be monitored through branded domain endpoints.
- Standards reference: `.heady/branding.md`
