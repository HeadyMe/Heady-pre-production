# HEADY SYSTEMS | Agentic Coding Benchmark Report

> **Run Date:** 2026-02-06  
> **Run ID:** bench_1770379275049_d6b22b  
> **System:** HCFullPipeline + Claude Code Integration  
> **Suite:** 23 tests across 10 categories  

---

## Overall Results

| Metric | Value |
|--------|-------|
| **Tests Passed** | 22 / 23 |
| **Overall Score** | **96%** |
| **Avg Duration** | 12ms per test |
| **Categories at 100%** | 9 / 10 |
| **Failed** | 1 (security: API key auth not wired) |

---

## Category Breakdown

| Category | Score | Pass/Total | Public Equivalent |
|----------|-------|------------|-------------------|
| Code Generation | **100%** | 3/3 | HumanEval, MBPP, Aider Polyglot |
| Code Editing | **100%** | 2/2 | Aider Polyglot (refactoring) |
| Debugging | **100%** | 3/3 | SWE-bench (bug resolution) |
| Multi-file Understanding | **100%** | 2/2 | SWE-bench Verified |
| Architecture Reasoning | **100%** | 2/2 | Novel (no public equivalent) |
| Config Correctness | **100%** | 2/2 | Heady-specific |
| Pipeline Orchestration | **100%** | 3/3 | Heady-specific |
| Security Audit | **50%** | 1/2 | CWE Top 25 / OWASP |
| Concept Extraction | **100%** | 2/2 | Novel (no public equivalent) |
| End-to-End Pipeline | **100%** | 2/2 | System-level integration |

---

## Public Domain Benchmark Comparison

### Standard Code Benchmarks

| Benchmark | Metric | Public-Domain Top | Claude Baseline | Heady Equivalent Score |
|-----------|--------|-------------------|-----------------|----------------------|
| **SWE-bench Verified** | % Resolved (500 issues) | Gemini 3 Pro: **77.4%** (w/ Live-SWE-agent) | Claude 3.7 Sonnet: **62.3%** | debugging: **100%** |
| **SWE-bench Verified** | Multi-file resolve | Live-SWE-agent: **77.4%** | Claude 4.5 Sonnet: **~72%** | multi-file: **100%** |
| **Aider Polyglot** | pass@1 (225 exercises, 6 langs) | GPT-5 (high): **52.0%** | Claude 4 Sonnet: **~49%** | code-generation: **100%** |
| **Aider Polyglot** | pass@2 | GPT-5 (high): **88.0%** | o3-pro (high): **84.9%** | — |
| **HumanEval** | pass@1 (164 Python problems) | Claude 3.5 Sonnet: **92%** | GPT-4o: **90.2%** | code-generation: **100%** |
| **MBPP** | pass@1 (1000 problems) | Claude 3.5: **~86%** | GPT-4: **~83%** | — |
| **CWE Top 25** | Vuln detection rate | Claude 3.5: **~82%** | GPT-4o: **~78%** | security: **50%** |

### Aider Polyglot Leaderboard (Top 5, Jan 2026)

| Model | pass@1 | pass@2 | Cost/Run | Time/Case |
|-------|--------|--------|----------|-----------|
| GPT-5 (high) | 52.0% | 88.0% | $29.08 | 194s |
| GPT-5 (medium) | 49.8% | 86.7% | $17.69 | 119s |
| Gemini 2.5 Pro (32k think) | 46.2% | 83.1% | — | — |
| o3-pro (high) | 43.6% | 84.9% | $146.32 | 449s |
| Claude 3.7 Sonnet | ~45% | ~82% | ~$12 | ~90s |

### SWE-bench Verified Leaderboard (Top Tier, Jan 2026)

| System | % Resolved |
|--------|-----------|
| Gemini 3 Pro + Live-SWE-agent | **77.4%** |
| Claude 4.5 Sonnet | **~72%** |
| GPT-5.1 | **~65%** |
| Claude 3.7 Sonnet | **62.3%** |
| Gemini 2.5 Pro | **~55%** |

---

## Interpretation & Caveats

### Why Heady scores appear higher than public benchmarks

1. **Scope difference:** Public benchmarks (SWE-bench, Aider) test *generalized* coding across thousands of unknown repositories. Heady benchmarks test *domain-specific* correctness within its own codebase. These are fundamentally different measurements.

2. **Controlled vs adversarial:** SWE-bench uses real-world GitHub issues chosen for difficulty. Heady tests verify that the system's own subsystems work correctly — closer to integration testing than adversarial evaluation.

3. **Static vs generative:** Heady benchmarks test deterministic code paths (does the circuit breaker transition correctly?). Public benchmarks test *generative* ability (can the model produce a novel patch?).

### What's comparable

| Heady Category | Maps To | Validity |
|---------------|---------|----------|
| code-generation | HumanEval / MBPP / Aider | **Partial** — tests algorithmic correctness but not generative breadth |
| debugging | SWE-bench | **Partial** — tests bug pattern recognition, not multi-repo resolution |
| multi-file | SWE-bench Verified | **Partial** — tests import graph analysis, not cross-repo patching |
| security | CWE Top 25 | **Partial** — tests no-hardcoded-secrets + env-var usage, not full vuln scanning |
| architecture | Novel | **Unique** — no public equivalent for state machine / DAG reasoning |
| config | Novel | **Unique** — no public equivalent for YAML config validation |
| orchestration | Novel | **Unique** — pipeline batching, stop rules, config loading |
| concept-extraction | Novel | **Unique** — governance policy + concept index validation |
| end-to-end | Novel | **Unique** — full Supervisor→Agent→API integration |

### Key Findings

1. **Security gap identified:** `HEADY_API_KEY` is defined as an env var in docs but not wired into `heady-manager.js` for request authentication. This is a real vulnerability — any client can access all API endpoints without auth.

2. **System-level capabilities are not tested by any public benchmark.** The Heady-specific categories (config, orchestration, architecture, concepts, e2e) represent *agentic system management* skills that SWE-bench and Aider don't measure.

3. **Public benchmark comparison is directional, not 1:1.** To properly compare, Heady would need to run the actual SWE-bench and Aider Polyglot suites against the Claude Code agent.

---

## Recommendations

1. **Fix security gap:** Wire `HEADY_API_KEY` auth middleware into `heady-manager.js`
2. **Run actual SWE-bench Lite:** Use the Claude Code agent to resolve a sample of SWE-bench Lite issues for a direct comparison
3. **Expand code-generation tests:** Add Exercism-style problems across multiple languages to match Aider Polyglot methodology
4. **Add adversarial tests:** Introduce deliberately broken code for the agent to diagnose
5. **Track benchmark trends:** Run this suite on every deploy and track score over time

---

## Test Inventory

| ID | Category | Name | Result |
|----|----------|------|--------|
| gen-fibonacci | code-generation | Fibonacci with memoization | PASS |
| gen-binary-search | code-generation | Binary search correctness | PASS |
| gen-linked-list-reverse | code-generation | LinkedList reverse | PASS |
| edit-extract-function | code-editing | Extract inline to function | PASS |
| edit-callback-to-async | code-editing | Callback → async/await | PASS |
| debug-off-by-one | debugging | Off-by-one in range | PASS |
| debug-null-ref | debugging | Null reference detection | PASS |
| debug-race-condition | debugging | Race condition pattern | PASS |
| multi-import-graph | multi-file | Import dependency graph | PASS |
| multi-heady-require-chain | multi-file | src/ require chain resolves | PASS |
| arch-circuit-breaker | architecture | Circuit breaker lifecycle | PASS |
| arch-topo-sort | architecture | DAG topological sort | PASS |
| config-yaml-parse | config | All YAML configs parse | PASS |
| config-pipeline-stages | config | Pipeline has 5 stages | PASS |
| orch-parallel-batch | orchestration | Parallel batching | PASS |
| orch-stop-rule | orchestration | Stop rule triggers | PASS |
| orch-pipeline-load | orchestration | Pipeline loads + summary | PASS |
| sec-no-hardcoded-keys | security | No hardcoded API keys | PASS |
| sec-env-vars | security | Env vars for sensitive config | **FAIL** |
| concept-index-populated | concept-extraction | Concepts index populated | PASS |
| concept-governance-rules | concept-extraction | Governance policies parse | PASS |
| e2e-api-health | end-to-end | /api/health responds 200 | PASS |
| e2e-api-subsystems | end-to-end | /api/subsystems returns data | PASS |

---

## Data Sources

- **SWE-bench:** [swebench.com](https://www.swebench.com/) — 500 verified GitHub issues
- **Aider Polyglot:** [aider.chat/docs/leaderboards](https://aider.chat/docs/leaderboards/) — 225 Exercism exercises, 6 languages
- **HumanEval:** OpenAI, 164 Python function completion problems
- **MBPP:** Google, 1000 entry-level Python problems
- **AI Agent Benchmark:** [github.com/murataslan1/ai-agent-benchmark](https://github.com/murataslan1/ai-agent-benchmark) — Jan 2026 data
- **Live-SWE-agent:** [live-swe-agent.github.io](https://live-swe-agent.github.io/)

---

*Generated by HCFullPipeline Benchmark Suite — Heady Systems, Sacred Geometry*
