---
description: Stop Cloudflare Tunnel (HeadyEcosystem)
---

# Stop Cloudflare Tunnel Workflow

## Purpose
Safely stop Cloudflare Tunnel and clean up connections.

## Steps

1. **Check Tunnel Status**
   ```powershell
   # List running tunnels
   cloudflared tunnel list
   
   # Check specific tunnel
   cloudflared tunnel info heady-tunnel
   ```

2. **Stop Tunnel Service**
   ```powershell
   # If running as service
   cloudflared service stop
   
   # Verify stopped
   Get-Service cloudflared
   ```

3. **Stop Tunnel Process**
   ```powershell
   # If running as process
   Stop-Process -Name cloudflared -Force
   
   # Verify no processes
   Get-Process cloudflared -ErrorAction SilentlyContinue
   ```

4. **Cleanup Connections**
   ```powershell
   # Kill any hanging connections
   netstat -ano | findstr :3300
   netstat -ano | findstr :3301
   netstat -ano | findstr :8080
   ```

5. **Verify Services Stopped**
   ```powershell
   # Check that local services are still running
   curl http://localhost:3300/health
   
   # But external access is stopped
   # curl https://heady.yourdomain.com/health (should fail)
   ```

6. **Optional: Remove Tunnel**
   ```powershell
   # Only if permanently removing
   cloudflared tunnel delete heady-tunnel
   ```

## Restart Tunnel
```powershell
# To restart, use /start-tunnel workflow
```

## Troubleshooting
```powershell
# If tunnel won't stop
taskkill /F /IM cloudflared.exe

# Check for orphaned processes
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"}
```
