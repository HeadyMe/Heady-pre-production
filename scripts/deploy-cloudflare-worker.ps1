# Deploy HeadyMCP to Cloudflare Workers
# Requires: Cloudflare CLI (wrangler)

param(
    [string]$WorkerName,
    [string]$ServiceScript
)

# Install wrangler if not present
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    npm install -g wrangler
}

# Authenticate with Cloudflare
wrangler login

# Create worker directory
$workerDir = "workers/$WorkerName"
New-Item -ItemType Directory -Path $workerDir -Force

# Create worker code
$code = @"
import { handleRequest } from '../$ServiceScript';

export default {
    async fetch(request, env, ctx) {
        return handleRequest(request);
    }
};
"@
Set-Content -Path "$workerDir/index.js" -Value $code

# Create wrangler.toml
$wranglerConfig = @"
name = "$WorkerName"
main = "index.js"
compatibility_date = "2026-02-03"
"@
Set-Content -Path "$workerDir/wrangler.toml" -Value $wranglerConfig

# Deploy worker
Set-Location $workerDir
wrangler deploy
