# HeadyComputeCluster — HA Hybrid Architecture

## Overview

```
                    ┌──────────────────────────────────────────┐
                    │         CLOUD TIER (Render)               │
                    │                                          │
                    │  headysystems.com ──┐                    │
                    │  headycloud.com ────┤ HeadyComputeCluster│
                    │  headyconnection.com┘ (cluster manager)  │
                    │         │                                │
                    │    Intelligence Engine                    │
                    │    ├── Task Scheduler (DAG)               │
                    │    ├── Parallel Allocator (node-aware)    │
                    │    ├── Speed Controller                   │
                    │    └── Anti-Stagnation Watchdog           │
                    └──────────┬───────────────────────────────┘
                               │ Cloudflare Tunnel (zero-trust)
                    ┌──────────┴───────────────────────────────┐
                    │        COMPUTE TIER (Physical)            │
                    │                                          │
                    │  ┌─────────────────────┐                 │
                    │  │ Ryzen 9 Mini-PC     │  POWERHOUSE     │
                    │  │ 32GB RAM            │  Tier            │
                    │  │ Max 8 concurrent    │                 │
                    │  │ HeadyNode Agent     │                 │
                    │  └─────────────────────┘                 │
                    │                                          │
                    │  ┌─────────────────────┐                 │
                    │  │ Old Laptop          │  STANDARD/LIGHT │
                    │  │ HeadyNode Agent     │  Tier            │
                    │  └─────────────────────┘                 │
                    │                                          │
                    │  ┌─────────────────────┐                 │
                    │  │ Colab Pro+ (GPU)    │  GPU Tier        │
                    │  │ via ngrok tunnel    │  (existing)      │
                    │  └─────────────────────┘                 │
                    └──────────────────────────────────────────┘
```

## Node Tiers

| Tier | Min Cores | Min RAM | Priority Boost | Max Concurrent |
|------|-----------|---------|---------------|----------------|
| **POWERHOUSE** | 12+ | 24GB+ | +0.3 | cores/2 (up to 16) |
| **STANDARD** | 4+ | 8GB+ | +0.1 | cores/2 |
| **LIGHT** | 2+ | 4GB+ | +0.0 | 1-2 |

The Ryzen 9 (32GB) classifies as **POWERHOUSE** — highest priority for task routing.

## Task Routing Policy

| Task Type | Preferred Location | Reason |
|-----------|-------------------|--------|
| `build` | Physical nodes | CPU-intensive, saves Render minutes |
| `test` | Physical nodes | CPU-intensive |
| `batch_job` | Physical nodes | Long-running, offloads cloud |
| `data_process` | Physical nodes | RAM-intensive |
| `ai_inference` | Physical/GPU nodes | Needs CPU/GPU power |
| `docker_build` | Physical nodes | Needs Docker daemon |
| `indexing` | Physical nodes | I/O intensive |
| `deployment` | Cloud only | Needs Render access |
| `site-gen` | Cloud only | Needs Render file system |
| `verify` | Cloud only | Needs cloud endpoints |

## Heartbeat Protocol

1. Node sends heartbeat every **45 seconds**
2. Cluster manager TTL is **120 seconds**
3. If no heartbeat for >120s → node marked **stale**
4. If stale for >600s → node marked **offline**
5. Active health probes every **30 seconds**
6. 3 consecutive failures → node marked **unhealthy**

## Reliability Scoring

- Base score: `(completed / total_tasks) * 100`
- Consecutive failure penalty: `-10 per failure` (max -50)
- P0 tasks require reliability ≥ 80
- Auto-demote at reliability < 30

## API Endpoints

### Cloud-side (headysystems.com)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cluster/nodes/register` | Register a compute node |
| POST | `/api/cluster/nodes/heartbeat` | Node heartbeat |
| GET | `/api/cluster/state` | Full cluster state |
| GET | `/api/cluster/nodes` | List all nodes |
| GET | `/api/cluster/nodes/:id` | Get single node |
| DELETE | `/api/cluster/nodes/:id` | Remove a node |
| POST | `/api/cluster/tasks/route` | Route task to cluster |
| POST | `/api/cluster/tasks/complete` | Report task completion |
| GET | `/api/cluster/can-handle/:type` | Check capability |
| GET | `/api/cluster/tasks/history` | Task history |

### Node-side (HeadyNode Agent)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/node/health` | Node health + hardware |
| POST | `/api/node/task` | Accept task dispatch |
| GET | `/api/node/tasks` | Active tasks |
| GET | `/api/node/system` | System info |
| POST | `/api/node/execute` | Manual task execution |

## Setup: Mini-Computer

```bash
# On the mini-computer:
chmod +x scripts/setup-heady-node.sh
HEADY_NODE_ID="ryzen9-mini" \
HEADY_NODE_NAME="Ryzen 9 Powerhouse" \
  ./scripts/setup-heady-node.sh

# After Cloudflare Tunnel is configured:
# Edit /etc/heady-node.env and set HEADY_TUNNEL_URL
sudo systemctl restart heady-node
```

## Setup: Old Laptop

```bash
HEADY_NODE_ID="laptop-backup" \
HEADY_NODE_NAME="Backup Compute Node" \
  ./scripts/setup-heady-node.sh
```

## Files

| File | Purpose |
|------|---------|
| `src/cluster/compute-cluster-manager.js` | Server-side cluster manager |
| `src/cluster/heady-node-agent.js` | Client-side node agent |
| `src/cluster/CLUSTER_ARCHITECTURE.md` | This document |
| `scripts/setup-heady-node.sh` | Mini-computer bootstrap script |
| `src/intelligence/intelligence-manifest.json` | Cluster config section |
| `src/intelligence/parallel-allocator.js` | Node-aware task routing |
