# Render Protocol for Heady Systems

## Overview

This document outlines the protocol for deploying and managing the Heady Systems ecosystem on Render.com. The system is deployed as a hybrid Node.js/Python web service using Infrastructure as Code (IaC) via `render.yaml`.

## Deployment Architecture

The service `heady-manager` runs on a Node.js runtime but also installs Python dependencies. This allows it to serve as both the API gateway/web server and orchestrate local Python worker processes for inference and auditing.

### Key Components

1.  **Web Service (`heady-manager`)**:
    *   **Runtime**: Node.js
    *   **Build Command**: `npm install && pip install -r requirements.txt`
    *   **Start Command**: `node heady-manager.js`
    *   **Health Check**: `/api/health`

## Environment Configuration

### Secret Groups

Use Render's "Env Groups" to manage secrets securely across services. Create a group named `heady-shared-secrets` (or similar) and link it to your service.

**Required Secrets:**
*   `HEADY_API_KEY`: A strong, unique key for Admin API access.
*   `HF_TOKEN`: Hugging Face API token for inference.

**Optional Secrets:**
*   `REMOTE_GPU_HOST`, `REMOTE_GPU_PORT`: If using external GPU resources.
*   `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_WEBHOOK_SECRET`: For GitHub App integration.
*   `DATABASE_URL`: If you add a database later.

### Environment Variables

The `render.yaml` sets default values for many variables. You can override these in the Render dashboard if needed.

*   `NODE_ENV`: Set to `production`.
*   `HEADY_ADMIN_ROOT`: set to `/opt/render/project/src` on Render.
*   `HEADY_CORS_ORIGINS`: Update this to match your deployed URL (e.g., `https://your-app-name.onrender.com`).

## Deployment Process

1.  **Connect Repository**: Link your GitHub/GitLab repo to Render.
2.  **Blueprints**: Render should automatically detect `render.yaml`. Click "New Blueprint Instance".
3.  **Configure**: Review the service name and plan. Ensure the `heady-shared-secrets` group is created and populated beforehand, or enter the values manually during setup.
4.  **Deploy**: Click "Apply". Render will build and deploy the service.

## Operational Protocol

### Monitoring

*   **Logs**: View logs in the Render Dashboard. The application logs in JSON format in production (`HEADY_LOG_FORMAT=json`) for easier parsing by log management tools.
*   **Health**: The `/api/health` endpoint is used by Render to verify uptime.
*   **Admin UI**: Access the internal system status via `https://your-app-name.onrender.com/admin` using your `HEADY_API_KEY`.

### Scaling

*   **Vertical Scaling**: If the Python worker (`process_data.py`) consumes too much RAM, upgrade the Render instance plan (e.g., from Starter to Standard or Pro).
*   **Concurrency**: Adjust `HF_MAX_CONCURRENCY` and `HEADY_PY_MAX_CONCURRENCY` env vars to match the resources of your instance plan.

### Updates

*   **Automatic Deploys**: By default, pushing to the main branch triggers a deployment.
*   **Manual Deploys**: You can trigger a manual deploy from the Render dashboard to clear caches or redeploy a specific commit.

## Troubleshooting

*   **Build Failures**: Check the "Logs" tab. Common issues include missing Python dependencies or Node.js version mismatches.
*   **502 Bad Gateway**: Often means the application crashed or didn't start within the timeout. Check logs for startup errors (e.g., missing API keys).
*   **Rate Limiting**: If you hit 429 errors, increase `HEADY_RATE_LIMIT_MAX` or upgrade your plan if it's a legitimate traffic spike.

## Best Practices

*   **Do not commit `.env`**: Always use Render's environment variable storage.
*   **Persistent Data**: The current setup uses ephemeral storage. If you need to store files permanently (uploads, logs), add a "Persistent Disk" in Render and mount it (e.g., to `/opt/render/project/data`).
*   **Security**: Rotate `HEADY_API_KEY` periodically.
