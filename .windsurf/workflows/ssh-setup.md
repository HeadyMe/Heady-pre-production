---
description: Configure SSH keys for secure authentication
---

# SSH Setup Workflow

## Purpose
Configure SSH keys for secure Git operations and server access.

## Steps

1. **Generate SSH Key**
   ```powershell
   # Generate new SSH key
   ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/heady_ed25519
   ```

2. **Add to SSH Agent**
   ```powershell
   # Start SSH agent
   Start-Service ssh-agent
   
   # Add key to agent
   ssh-add ~/.ssh/heady_ed25519
   ```

3. **Add to GitHub**
   ```powershell
   # Copy public key
   Get-Content ~/.ssh/heady_ed25519.pub | Set-Clipboard
   
   # Then add to GitHub: Settings > SSH and GPG keys > New SSH key
   ```

4. **Configure SSH Config**
   ```powershell
   # Create/edit ~/.ssh/config
   @"
   Host github.com
     HostName github.com
     User git
     IdentityFile ~/.ssh/heady_ed25519
     IdentitiesOnly yes
   
   Host render.com
     HostName ssh.render.com
     User git
     IdentityFile ~/.ssh/heady_ed25519
   "@ | Out-File -FilePath ~/.ssh/config -Encoding UTF8
   ```

5. **Test SSH Connection**
   ```powershell
   # Test GitHub connection
   ssh -T git@github.com
   
   # Should see: "Hi username! You've successfully authenticated..."
   ```

6. **Update Git Remote to SSH**
   ```powershell
   # Change from HTTPS to SSH
   git remote set-url origin git@github.com:username/Heady.git
   ```

7. **Setup Script Automation**
   ```powershell
   # Run automated setup
   .\scripts\setup_ssh.ps1
   ```

## Security Notes
- Keep private key secure (never share)
- Use passphrase for additional security
- Rotate keys periodically
- Use different keys for different services
