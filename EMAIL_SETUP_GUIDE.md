<!-- HEADY_BRAND:BEGIN -->
<!-- HEADY SYSTEMS :: SACRED GEOMETRY -->
<!-- FILE: EMAIL_SETUP_GUIDE.md -->
<!-- LAYER: root -->
<!--  -->
<!--         _   _  _____    _    ____   __   __ -->
<!--        | | | || ____|  / \  |  _ \ \ \ / / -->
<!--        | |_| ||  _|   / _ \ | | | | \ V /  -->
<!--        |  _  || |___ / ___ \| |_| |  | |   -->
<!--        |_| |_||_____/_/   \_\____/   |_|   -->
<!--  -->
<!--    Sacred Geometry :: Organic Systems :: Breathing Interfaces -->
<!-- HEADY_BRAND:END -->

# HEADY EMAIL NOTIFICATION SETUP

## Quick Setup for eric@hadyconnection.org

The **HeadySync** workflow (`hsync` command) now automatically sends checkpoint status reports to **eric@hadyconnection.org** at every checkpoint.

## Email Configuration

### Step 1: Set Environment Variables

You need to configure SMTP credentials for sending emails. The easiest method is using Gmail with an App Password.

#### For Gmail (Recommended)

1. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in to your Google account
   - Create a new App Password for "Heady Systems"
   - Copy the 16-character password

2. **Set Environment Variables (Windows):**

```powershell
# Temporary (current session only)
$env:HEADY_SMTP_USER = "your-email@gmail.com"
$env:HEADY_SMTP_PASSWORD = "your-app-password"

# Permanent (system-wide)
[System.Environment]::SetEnvironmentVariable("HEADY_SMTP_USER", "your-email@gmail.com", "User")
[System.Environment]::SetEnvironmentVariable("HEADY_SMTP_PASSWORD", "your-app-password", "User")
```

3. **Or Create .env File:**

Copy `.env.example` to `.env` and configure:

```bash
HEADY_SMTP_SERVER=smtp.gmail.com
HEADY_SMTP_PORT=587
HEADY_SMTP_USER=your-email@gmail.com
HEADY_SMTP_PASSWORD=your-app-password-here
HEADY_FROM_EMAIL=heady@hadyconnection.org
HEADY_TO_EMAIL=eric@hadyconnection.org
```

### Step 2: Test Email Notification

```bash
# Test the notifier
python HeadyAcademy/HeadyNotifier.py

# Run a sync to test full workflow
hsync "Test: Email notification setup"
```

## What Gets Emailed

### Checkpoint Status Report

At every checkpoint, you'll receive a beautifully formatted HTML email with:

**📊 HeadyRegistry System Status**
- Total Capabilities
- Nodes count
- Workflows count  
- Services count
- Tools count

**🔄 Sync Operation**
- Status (SUCCESS/ERROR)
- Event type
- Timestamp
- Commit hash
- Duration

**🎯 Active Capabilities**
- List of active nodes
- Available workflows

### Example Email

```
Subject: ∞ Heady Checkpoint Report - 2024-01-01 12:00:00

∞ HEADY CHECKPOINT REPORT
Sacred Geometry :: Organic Systems :: Breathing Interfaces

═══════════════════════════════════════════════════════════════

📊 HEADY REGISTRY SYSTEM STATUS

Total Capabilities: 50
Nodes: 19
Workflows: 7
Services: 6
Tools: 21

═══════════════════════════════════════════════════════════════

🔄 SYNC OPERATION

Status: SUCCESS
Event: checkpoint
Timestamp: 2024-01-01T12:00:00Z
Commit: abc123
Message: Feature: Added new capability

═══════════════════════════════════════════════════════════════

🎯 ACTIVE CAPABILITIES

Nodes: LENS, MEMORY, BRAIN, CONDUCTOR, BRIDGE, MUSE...
Workflows: hcautobuild, deploy-system, heady-sync...

∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞
```

## Workflow Integration

### The `hsync` Command

The workflow shortcut you wanted is:

```bash
hsync
```

This executes the complete flow:
1. **Modify** - Detect changes
2. **Stage** - `git add -A`
3. **Commit** - With message
4. **Prep** - Prepare for checkpoint
5. **HCAutoBuild** - `hc -a` (automated checkpoint)
6. **HeadyRegistry Status** - Capture system state
7. **Email Notification** - Send to eric@hadyconnection.org ✉️
8. **Push** - `hs` (push to all remotes)
9. **Verify** - Confirm local/remote sync
10. **Monitor** - HeadyConductor tracks everything

### Custom Message

```bash
hsync "Feature: Integrated email notifications"
```

## Email Notification Settings

### Configuration File

HeadyNotifier stores configuration in `.heady/notifier_config.json`:

```json
{
  "enabled": true,
  "smtp_server": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "your-email@gmail.com",
  "smtp_password": "your-app-password",
  "from_email": "heady@hadyconnection.org",
  "to_email": "eric@hadyconnection.org",
  "send_on_checkpoint": true,
  "send_on_error": true,
  "send_on_complete": true
}
```

### Disable Email Notifications

```python
from HeadyAcademy.HeadyNotifier import HeadyNotifier

notifier = HeadyNotifier()
notifier.config["enabled"] = False
notifier.save_config()
```

### Change Email Recipient

```python
notifier.config["to_email"] = "different@email.com"
notifier.save_config()
```

## Troubleshooting

### Email Not Sending

1. **Check credentials:**
   ```bash
   echo $env:HEADY_SMTP_USER
   echo $env:HEADY_SMTP_PASSWORD
   ```

2. **Verify SMTP settings:**
   - Gmail: `smtp.gmail.com:587`
   - Outlook: `smtp-mail.outlook.com:587`
   - Custom: Check your email provider

3. **Check firewall:**
   - Ensure port 587 is not blocked
   - Allow Python through firewall

4. **Test manually:**
   ```python
   from HeadyAcademy.HeadyNotifier import HeadyNotifier
   
   notifier = HeadyNotifier()
   test_data = {"total_capabilities": 50, "nodes": 19}
   notifier.send_checkpoint_report(test_data)
   ```

### Gmail App Password Issues

- **2-Factor Authentication Required:** Gmail App Passwords only work with 2FA enabled
- **Generate New Password:** If expired, generate a new one
- **Use Exact Password:** Copy-paste the 16-character password exactly

### Email in Spam

Check spam folder and mark as "Not Spam" to whitelist future emails.

## Alternative SMTP Providers

### Outlook/Office 365

```bash
HEADY_SMTP_SERVER=smtp-mail.outlook.com
HEADY_SMTP_PORT=587
HEADY_SMTP_USER=your-email@outlook.com
HEADY_SMTP_PASSWORD=your-password
```

### SendGrid

```bash
HEADY_SMTP_SERVER=smtp.sendgrid.net
HEADY_SMTP_PORT=587
HEADY_SMTP_USER=apikey
HEADY_SMTP_PASSWORD=your-sendgrid-api-key
```

### Custom SMTP Server

```bash
HEADY_SMTP_SERVER=mail.yourdomain.com
HEADY_SMTP_PORT=587
HEADY_SMTP_USER=heady@yourdomain.com
HEADY_SMTP_PASSWORD=your-password
```

## Security Best Practices

1. **Never commit credentials** - Add `.env` to `.gitignore`
2. **Use App Passwords** - Not your main email password
3. **Rotate passwords** - Change periodically
4. **Limit permissions** - Use dedicated email account
5. **Environment variables** - Preferred over config files

## Integration with HeadyConductor

All email notifications are tracked in HeadyMemory:

```python
from HeadyAcademy.HeadyMemory import HeadyMemory

memory = HeadyMemory()

# Query email notifications
notifications = memory.query(tags=["email", "notification"])

# Check if emails were sent
checkpoint_emails = memory.query(
    category="sync_operation",
    tags=["checkpoint"]
)
```

## Summary

✅ **Workflow Shortcut:** `hsync`  
✅ **Email Recipient:** eric@hadyconnection.org  
✅ **Sent At:** Every checkpoint (after HCAutoBuild)  
✅ **Contains:** Full HeadyRegistry status + sync details  
✅ **Format:** Beautiful HTML + plain text  
✅ **Tracked:** All notifications logged in HeadyMemory  
✅ **Monitored:** HeadyConductor has full awareness  

---

**∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞**

Every checkpoint status report automatically emailed for complete awareness.
