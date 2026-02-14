# 🚨 IMMEDIATE ACTION PLAN: Security & Architecture Remediation

**Created:** 2026-02-14  
**Priority:** CRITICAL  
**Issue:** [#41](https://github.com/HeadyMe/Heady-pre-production/issues/41)  
**Status:** 🔴 IN PROGRESS

---

## ⏱️ Quick Status Dashboard

| Phase | Status | ETA | Owner |
|-------|--------|-----|-------|
| **Phase 1: Security** | 🟡 IN PROGRESS | 2h | @HeadyMe |
| **Phase 2: Architecture** | ⏸️ BLOCKED | 1 week | @HeadyMe |
| **Phase 3: CI/CD** | 🟡 IN PROGRESS | 3 days | @HeadyMe |
| **Phase 4: Documentation** | ⏸️ PENDING | 2 days | @HeadyMe |
| **Phase 5: Performance** | ⏸️ PENDING | 1 week | @HeadyMe |

---

## 🔥 PHASE 1: CRITICAL SECURITY FIXES (DO THIS NOW)

### ✅ Completed (2026-02-14)

- [x] Fixed `.gitignore` merge conflicts
- [x] Added security exclusions to `.gitignore`
- [x] Created `scripts/security-remediation.ps1`
- [x] Enhanced CI workflow with security scanning

### ⚠️ IMMEDIATE ACTION REQUIRED

#### 1. Remove Sensitive Files from Git History

```powershell
# DRY RUN first to see what will be removed
.\scripts\security-remediation.ps1 -DryRun

# If output looks correct, execute removal
.\scripts\security-remediation.ps1 -Force

# Force push to remote (DESTRUCTIVE - all team members must re-clone)
git push origin --force --all
git push origin --force --tags
```

**Files being removed from history:**
- `.env.hybrid` (contains `DATABASE_URL=postgresql://heady:heady_secret@...`)
- `server.pid`
- `audit_logs.jsonl`
- `.heady_deploy_log.jsonl`
- `heady-manager.js.bak`

#### 2. Rotate ALL Exposed Credentials

**From `.env.hybrid` exposure:**

```bash
# Database credentials
DATABASE_URL=postgresql://heady:heady_secret@heady-postgres:5432/heady
REDIS_URL=redis://heady-redis:6379
```

**Action checklist:**

- [ ] Rotate PostgreSQL password for user `heady`
- [ ] Update all services with new database URL
- [ ] Rotate Redis password (if set)
- [ ] Review `audit_logs.jsonl` for other exposed secrets
- [ ] Check GitHub commit history for any API keys in commit messages

#### 3. Enable GitHub Security Features

- [ ] Go to **Settings > Code security and analysis**
- [ ] Enable **Dependency graph** (if not already enabled)
- [ ] Enable **Dependabot alerts**
- [ ] Enable **Dependabot security updates**
- [ ] Enable **Secret scanning** (requires GitHub Advanced Security for private repos)
- [ ] Enable **Push protection** for secret scanning

#### 4. Configure Branch Protection

- [ ] Go to **Settings > Branches > Add rule**
- [ ] Branch name pattern: `main`
- [ ] Enable:
  - [x] Require a pull request before merging
  - [x] Require status checks to pass (CI must pass)
  - [x] Require conversation resolution before merging
  - [x] Do not allow bypassing the above settings

---

## 🏛️ PHASE 2: ARCHITECTURE CLEANUP (Start After Phase 1)

### Consolidate Duplicate Scripts

**Current state:**
```
root/
├── hcautobuild.ps1 (21KB)
├── hc_autobuild.ps1 (36KB)  ← different name, different size
├── hcautobuild_enhanced.ps1 (21KB)
└── hcautobuild_optimizer.ps1 (20KB)
```

**Target state:**
```
scripts/
└── hc-autobuild.ps1 (unified, parameterized)
```

**Action:**

```powershell
# Compare files to identify differences
git diff --no-index hcautobuild.ps1 hc_autobuild.ps1
git diff --no-index hcautobuild.ps1 hcautobuild_enhanced.ps1

# Create unified script
new-item scripts/hc-autobuild.ps1 -ItemType File

# After consolidation, remove old versions
git rm hcautobuild*.ps1 hc_autobuild.ps1
```

### Refactor God Classes

**Priority files:**

1. **`heady-manager.js` (90KB)**
   - Extract: routing, middleware, health checks, node orchestration
   - Target: < 500 lines per module

2. **`site-generator.js` (91KB)**
   - Split by: template type, site type, build process
   - Target: < 1000 lines per file

### Reorganize Test Files

```bash
# Current: tests scattered at root
# Target structure:
tests/
├── unit/
├── integration/
└── e2e/

# Move test files
mkdir -p tests/{unit,integration,e2e}
git mv test_*.js tests/unit/
```

### Resolve Python/JavaScript Mixing

```bash
# Current problem: src/ contains both .js and .py files
src/
├── __init__.py  ← Python
├── agents/      (JavaScript)
└── cloud-bridge.js

# Target structure:
backend/
├── python/      # All Python code
└── nodejs/      # All JavaScript code
```

### Consolidate Config Directories

```bash
# Remove duplicate config directories
git mv configs/* config/
git rm -r configs/
```

### Standardize Package Manager

```bash
# Option A: Keep npm (recommended for existing setup)
rm pnpm-lock.yaml
echo "package-lock=true" >> .npmrc

# Option B: Switch to pnpm (faster, more efficient)
rm package-lock.json
npm install -g pnpm
pnpm import  # converts package-lock.json to pnpm-lock.yaml
```

---

## 🛡️ PHASE 3: CI/CD HARDENING (Parallel with Phase 2)

### ✅ Completed

- [x] Enhanced `ci.yml` with security scanning
- [x] Added `npm audit` step
- [x] Added TruffleHog secret scanning

### Remaining Tasks

- [ ] Add CodeQL analysis workflow
- [ ] Add dependency review for PRs
- [ ] Verify Docker multi-stage builds
- [ ] Add smoke test to `deploy-render.yml`
- [ ] Set up status badges in README

**Create `.github/workflows/codeql.yml`:**

```yaml
name: "CodeQL"
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1'  # Monday 6am

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript, python
      - uses: github/codeql-action/analyze@v3
```

---

## 📚 PHASE 4: DOCUMENTATION CONSOLIDATION

### Unify Version Numbers

**Current inconsistency:**
- `package.json`: `2.1.0`
- `.env.hybrid`: `2.0.0`
- `.env.example`: `3.0.0`
- Documentation: `3.0.0+`

**Single source of truth:** `heady-registry.json`

```javascript
// Update all files to read version from:
const { version } = require('./heady-registry.json');
```

### Consolidate README Files

**Current state:**
```
README.md (10KB)
README_CONDUCTOR.md (12KB)
README_CONNECTIVITY.md (3KB)
README_ECOSYSTEM.md (16KB)
README_HCAutoBuild.md (9KB)
README_SYSTEM.md (5KB)
```

**Target structure:**

```
README.md              # Main entry point with TOC
docs/
├── architecture/
│   ├── conductor.md
│   ├── connectivity.md
│   └── ecosystem.md
├── guides/
│   ├── hcautobuild.md
│   └── system.md
└── api/
```

---

## 🚀 PHASE 5: PERFORMANCE OPTIMIZATION

### Redis Connection Pooling

```javascript
// Verify in src/ files:
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});
```

### Structured Logging

```bash
npm install pino pino-pretty

# Replace console.log with:
const logger = require('pino')()
logger.info({ module: 'heady-manager' }, 'Service started')
logger.error({ err, user }, 'Authentication failed')
```

### Bundle Analysis

```bash
npm install --save-dev webpack-bundle-analyzer
npm run build -- --analyze
```

---

## 📊 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Open security vulnerabilities | Unknown | 0 | 🔴 |
| Secrets in Git history | 1+ | 0 | 🔴 |
| God classes (>1000 lines) | 2 | 0 | 🔴 |
| Test coverage | Unknown | >80% | 🔴 |
| Build time (CI) | ~3min | <2min | 🟡 |
| Duplicate code | High | <5% | 🔴 |

---

## 📞 Emergency Contacts

- **Security incidents:** eric@headysystems.com
- **CI/CD issues:** GitHub Actions logs
- **Architecture questions:** Review issue #41

---

## 📝 Daily Standup Template

**What I did yesterday:**
- [ ] Phase _ task _

**What I'm doing today:**
- [ ] Phase _ task _

**Blockers:**
- None / [describe]

**ETA to Phase 1 complete:**
- [time estimate]

---

**Last Updated:** 2026-02-14  
**Next Review:** 2026-02-15
