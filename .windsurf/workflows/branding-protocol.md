<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: .windsurf/workflows/branding-protocol.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _  __   __ -->
<!--        | | | || ____|  / \ \  / / -->
<!--        | |_| ||  _|   / _ \ \ V /  -->
<!--        |  _  || |___ / ___ \ | |   -->
<!--        |_| |_||_____/_/   \_\|_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

---
description: Heady ASCII Branding Protocol (retrofit + enforce)
---

# Heady ASCII Branding Protocol

## Goal
Ensure eligible source files are branded with a consistent, visually exciting ASCII header.

## What gets branded
- JavaScript/TypeScript: `.js`, `.jsx`, `.ts`, `.tsx`, `.cjs`, `.mjs`
- Python: `.py`
- PowerShell: `.ps1`
- Shell: `.sh`
- Markdown: `.md`
- YAML: `.yml`, `.yaml`
- Config (hash-comment style): `Dockerfile`, `.env*`, `.gitignore`, `.gitattributes`, `requirements.txt`, `docker-compose*.yml/.yaml`, `render.yml/.yaml`

## What is skipped
- Files that cannot safely contain comments: `.json`, `.lock`, `.ipynb`
- Generated/minified: `*.min.js`, `*.map`
- Large files (> 1MB)
- Ignored/build/vendor dirs: `.git/`, `node_modules/`, `dist/`, `build/`, `venv/`, `.venv/`, `__pycache__/`, `.pytest_cache/`

## One-time retrofit
1. Run:
   - `npm run brand:fix`

## Enforce going forward
1. Install Git hooks path (local repo setting):
   - `npm run hooks:install`
2. Ensure CI passes (GitHub Action):
   - Workflow: `.github/workflows/brand-headers.yml`

## Developer usage
- Check (no writes): `npm run brand:check`
- Fix in-place: `npm run brand:fix`

## Notes
- Branding is idempotent: existing branded blocks are updated/replaced, not duplicated.
- Python shebang/encoding lines are preserved above the branding block.
