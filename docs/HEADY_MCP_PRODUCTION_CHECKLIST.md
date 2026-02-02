# Heady MCP Production Checklist

## 1. Architecture & Scaling
- [ ] Server is built with FastMCP, uses async I/O for all network and DB calls, and avoids blocking work on the event loop
- [ ] Stateless pattern: all persistent state is in external DBs/caches; multiple replicas can run behind a load balancer without coordination
- [ ] Horizontal scaling plan exists (k8s/ECS/Ray Serve or similar) with target replica counts and autoscaling rules
- [ ] Request controls: timeouts, max payload size, rate limits, and bounded queues are configured for each server

## 2. mcp-compose / Gateway Configuration
- [ ] Server is registered in mcp-compose.yaml (or equivalent) with clear service name, transport (HTTP/stdio), env vars, ports, and healthcheck
- [ ] A unified HTTP gateway service exposes all MCP servers on one endpoint; clients (Arena, IDEs) use generated configs from this file
- [ ] Compose/gateway config is versioned in Git and part of CI/CD, not edited ad-hoc on servers

## 3. Security, OAuth, and Secrets
- [ ] All external access uses TLS; internal network policies restrict which services can talk to which MCP servers
- [ ] OAuth 2.1/OIDC is used where appropriate, with access + refresh tokens, auto-refresh on expiry, and encrypted token storage
- [ ] Token revocation paths exist (delete tokens, rotate secrets, invalidate sessions) and scopes are enforced per server/tool
- [ ] Secrets are kept in a secret manager or encrypted store (not in Git), and never logged

## 4. Observability (Metrics, Logs, Traces)
- [ ] OpenTelemetry is enabled for every FastMCP server and for the gateway/mcp-compose, exporting traces and metrics to a collector
- [ ] Structured JSON logs include: timestamp, server_id, tool_name, client_id, request_id/trace_id, status, and duration
- [ ] All telemetry uses consistent labels: server_id, tool_name, env, region, and (if applicable) tenant_id
- [ ] Dashboards exist showing per-tool and per-server p95/p99 latency, error rate, throughput, and resource saturation

## 5. Reliability & Performance Testing
- [ ] Load tests simulate expected and stress traffic, measuring latency, error rate, and resource usage at realistic concurrency
- [ ] Tools are small and focused; no "god tools" that do many steps with huge payloads in one call
- [ ] Known slow operations are cached or streamed (SSE/chunked) rather than returning massive responses
- [ ] SLOs defined (e.g., 99% of calls < 500 ms, < 1% errors) and alerts configured on SLO breaches

## 6. Lifecycle & Promotion
- [ ] Clear dev → stage → prod pipeline: builds, tests, security scans, and config checks run before promotion
- [ ] Rollback strategy documented: previous version kept available, config flags or routing can quickly revert traffic
- [ ] Each server has a lifecycle record (owner, purpose, deps, deprecation plan) in a central place (e.g., lifecycle MCP server)

## 7. Monitoring mcp-compose at Cluster Scale
- [ ] Monitoring stack (metrics/logs/traces backends + OTel Collectors) is sized and sharded/federated to handle all servers and growth
- [ ] mcp-compose/gateway exports metrics for upstream errors, timeouts, and per-backend latencies and is visible in the same dashboards
- [ ] Alerts cover both per-server and cluster-level issues (e.g., a percentage of tools failing across the cluster, or many servers timing out)

## 8. Heady-specific Arena & UX Integration
- [ ] Windsurf Arena and Heady dashboards surface: MCP server health, tool usage, latency hotspots, and links to traces for debugging
- [ ] All changes to MCP servers or mcp-compose configs are reflected in Arena metadata (names, descriptions, risk level) for human oversight

---

## Status: PENDING
Last reviewed: 2025-01-30
Next review: Before deployment
