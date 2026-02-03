---
description: Start Cloudflare Tunnel (HeadyEcosystem)
---

# Start Cloudflare Tunnel Workflow

## Purpose
Start Cloudflare Tunnel to expose local services securely to the internet.

## Steps

1. **Install Cloudflare Tunnel**
   ```powershell
   # Install cloudflared
   winget install Cloudflare.cloudflared
   ```

2. **Login to Cloudflare**
   ```powershell
   cloudflared tunnel login
   ```

3. **Create Tunnel**
   ```powershell
   # Create new tunnel
   cloudflared tunnel create heady-tunnel
   
   # Note the tunnel ID
   ```

4. **Configure Tunnel**
   ```yaml
   # Create config.yml
   tunnel: <tunnel-id>
   credentials-file: C:\Users\<user>\.cloudflared\<tunnel-id>.json
   
   ingress:
     - hostname: heady.yourdomain.com
       service: http://localhost:3300
     - hostname: api.heady.yourdomain.com
       service: http://localhost:3301
     - hostname: admin.heady.yourdomain.com
       service: http://localhost:8080
     - service: http_status:404
   ```

5. **Start Tunnel**
   ```powershell
   # Start tunnel
   cloudflared tunnel run heady-tunnel
   
   # Or run as service
   cloudflared service install
   cloudflared service start
   ```

6. **Configure DNS**
   ```powershell
   # Add DNS records
   cloudflared tunnel route dns heady-tunnel heady.yourdomain.com
   cloudflared tunnel route dns heady-tunnel api.heady.yourdomain.com
   cloudflared tunnel route dns heady-tunnel admin.heady.yourdomain.com
   ```

7. **Verify Tunnel**
   ```powershell
   # Check tunnel status
   cloudflared tunnel info heady-tunnel
   
   # Test endpoints
   curl https://heady.yourdomain.com/health
   ```

## Monitoring
```powershell
# View tunnel logs
cloudflared tunnel logs heady-tunnel

# Check tunnel metrics
cloudflared tunnel metrics
```

## Stop Tunnel
```powershell
# Stop service
cloudflared service stop

# Or stop process
Stop-Process -Name cloudflared
```
