# Deploy HeadyMCP to Cloudflare Workers
# Requires: Cloudflare CLI (wrangler) and esbuild

param(
    [string]$WorkerName,
    [string]$ServiceScript
)

# Install wrangler and esbuild if not present
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    npm install -g wrangler
}
if (-not (Get-Command esbuild -ErrorAction SilentlyContinue)) {
    npm install -g esbuild
}

# Authenticate with Cloudflare
wrangler login

# Create worker directory
$workerDir = "workers/$WorkerName"
New-Item -ItemType Directory -Path $workerDir -Force

# Copy service script to worker directory
$scriptName = $ServiceScript | Split-Path -Leaf
$serviceScriptPath = Resolve-Path $ServiceScript
Copy-Item -Path $serviceScriptPath -Destination $workerDir

# Create wrapper script
$wrapperCode = @"
const { handleRequest } = require('./$scriptName');

module.exports = {
    async fetch(request) {
        return handleRequest(request);
    }
};
"@
Set-Content -Path "$workerDir/wrapper.js" -Value $wrapperCode

# Bundle the wrapper script
esbuild "$workerDir/wrapper.js" --bundle --platform=node --target=es2022 --outfile="$workerDir/index.js"

# Create wrangler.toml
$wranglerConfig = @"
name = "$WorkerName"
main = "index.js"
compatibility_date = "2026-02-03"
compatibility_flags = [ "nodejs_compat" ]
"@
Set-Content -Path "$workerDir/wrangler.toml" -Value $wranglerConfig

# Deploy worker
Set-Location $workerDir
wrangler deploy
