# HEADY_BRAND:BEGIN
# HEADY SYSTEMS :: SACRED GEOMETRY
# FILE: HeadyAcademy/HeadyNotifier.py
# LAYER: root
# 
#         _   _  _____    _    ____   __   __
#        | | | || ____|  / \  |  _ \ \ \ / /
#        | |_| ||  _|   / _ \ | | | | \ V / 
#        |  _  || |___ / ___ \| |_| |  | |  
#        |_| |_||_____/_/   \_\____/   |_|  
# 
#    Sacred Geometry :: Organic Systems :: Breathing Interfaces
# HEADY_BRAND:END

"""
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║     ██╗  ██╗███████╗ █████╗ ██████╗ ██╗   ██╗                                ║
║     ██║  ██║██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝                                ║
║     ███████║█████╗  ███████║██║  ██║ ╚████╔╝                                 ║
║     ██╔══██║██╔══╝  ██╔══██║██║  ██║  ╚██╔╝                                  ║
║     ██║  ██║███████╗██║  ██║██████╔╝   ██║                                   ║
║     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                                   ║
║                                                                               ║
║     ∞ NOTIFIER - THE MESSENGER ∞                                              ║
║     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                            ║
║     Email notification system for checkpoint status reports                   ║
║     Integrated with HeadyConductor for automated notifications                ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime


class HeadyNotifier:
    """
    Email notification system for Heady checkpoints and status reports.
    Sends formatted status reports to configured recipients.
    """
    
    def __init__(self, config_path: str = None):
        self.config_path = Path(config_path) if config_path else Path(__file__).parent.parent / ".heady" / "notifier_config.json"
        self.config = self._load_config()
        
        print("∞ HeadyNotifier: Initialized - The Messenger is ready")
    
    def _load_config(self) -> Dict[str, Any]:
        """Load email configuration."""
        default_config = {
            "enabled": True,
            "smtp_server": os.getenv("HEADY_SMTP_SERVER", "smtp.gmail.com"),
            "smtp_port": int(os.getenv("HEADY_SMTP_PORT", "587")),
            "smtp_user": os.getenv("HEADY_SMTP_USER", ""),
            "smtp_password": os.getenv("HEADY_SMTP_PASSWORD", ""),
            "from_email": os.getenv("HEADY_FROM_EMAIL", "heady@hadyconnection.org"),
            "to_email": os.getenv("HEADY_TO_EMAIL", "eric@hadyconnection.org"),
            "send_on_checkpoint": True,
            "send_on_error": True,
            "send_on_complete": True
        }
        
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r') as f:
                    loaded_config = json.load(f)
                    default_config.update(loaded_config)
            except Exception as e:
                print(f"⚠ Could not load config: {e}")
        
        return default_config
    
    def save_config(self):
        """Save current configuration."""
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def send_checkpoint_report(self, registry_status: Dict[str, Any], 
                               sync_data: Dict[str, Any] = None) -> bool:
        """Send checkpoint status report email."""
        
        if not self.config.get("enabled") or not self.config.get("send_on_checkpoint"):
            print("∞ HeadyNotifier: Checkpoint notifications disabled")
            return False
        
        # Format email content
        subject = f"∞ Heady Checkpoint Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        html_body = self._format_checkpoint_html(registry_status, sync_data)
        text_body = self._format_checkpoint_text(registry_status, sync_data)
        
        return self._send_email(subject, html_body, text_body)
    
    def send_sync_complete(self, sync_data: Dict[str, Any]) -> bool:
        """Send sync completion notification."""
        
        if not self.config.get("enabled") or not self.config.get("send_on_complete"):
            return False
        
        subject = f"✓ Heady Sync Complete - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        html_body = self._format_sync_complete_html(sync_data)
        text_body = self._format_sync_complete_text(sync_data)
        
        return self._send_email(subject, html_body, text_body)
    
    def send_error_report(self, error_data: Dict[str, Any]) -> bool:
        """Send error notification."""
        
        if not self.config.get("enabled") or not self.config.get("send_on_error"):
            return False
        
        subject = f"✗ Heady Error Alert - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        html_body = self._format_error_html(error_data)
        text_body = self._format_error_text(error_data)
        
        return self._send_email(subject, html_body, text_body)
    
    def _format_checkpoint_html(self, registry_status: Dict[str, Any], 
                                 sync_data: Dict[str, Any] = None) -> str:
        """Format checkpoint report as HTML."""
        
        html = f"""
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px; }}
                .container {{ background-color: white; border-radius: 10px; padding: 30px; max-width: 800px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .header p {{ margin: 5px 0 0 0; opacity: 0.9; }}
                .section {{ margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 8px; }}
                .section h2 {{ color: #667eea; margin-top: 0; font-size: 18px; }}
                .stat {{ display: inline-block; margin: 10px 20px 10px 0; }}
                .stat-label {{ color: #666; font-size: 12px; text-transform: uppercase; }}
                .stat-value {{ color: #333; font-size: 24px; font-weight: bold; }}
                .status-healthy {{ color: #10b981; }}
                .status-warning {{ color: #f59e0b; }}
                .status-error {{ color: #ef4444; }}
                .footer {{ text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>∞ Heady Checkpoint Report</h1>
                    <p>Sacred Geometry :: Organic Systems :: Breathing Interfaces</p>
                </div>
                
                <div class="section">
                    <h2>📊 HeadyRegistry System Status</h2>
                    <div class="stat">
                        <div class="stat-label">Total Capabilities</div>
                        <div class="stat-value">{registry_status.get('total_capabilities', 0)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Nodes</div>
                        <div class="stat-value">{registry_status.get('nodes', 0)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Workflows</div>
                        <div class="stat-value">{registry_status.get('workflows', 0)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Services</div>
                        <div class="stat-value">{registry_status.get('services', 0)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-label">Tools</div>
                        <div class="stat-value">{registry_status.get('tools', 0)}</div>
                    </div>
                </div>
        """
        
        if sync_data:
            status_class = "status-healthy" if sync_data.get('status') == 'success' else "status-error"
            html += f"""
                <div class="section">
                    <h2>🔄 Sync Operation</h2>
                    <p><strong>Status:</strong> <span class="{status_class}">{sync_data.get('status', 'unknown').upper()}</span></p>
                    <p><strong>Event:</strong> {sync_data.get('event', 'N/A')}</p>
                    <p><strong>Timestamp:</strong> {sync_data.get('timestamp', 'N/A')}</p>
                    {f"<p><strong>Commit:</strong> {sync_data.get('data', {}).get('hash', 'N/A')}</p>" if sync_data.get('data', {}).get('hash') else ""}
                    {f"<p><strong>Duration:</strong> {sync_data.get('data', {}).get('duration_seconds', 'N/A')}s</p>" if sync_data.get('data', {}).get('duration_seconds') else ""}
                </div>
            """
        
        html += f"""
                <div class="section">
                    <h2>🎯 Active Capabilities</h2>
                    <p><strong>Nodes:</strong> {', '.join(registry_status.get('node_list', [])[:10])}</p>
                    <p><strong>Workflows:</strong> {', '.join(registry_status.get('workflow_list', []))}</p>
                </div>
                
                <div class="footer">
                    <p>∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞</p>
                    <p>Generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def _format_checkpoint_text(self, registry_status: Dict[str, Any], 
                                 sync_data: Dict[str, Any] = None) -> str:
        """Format checkpoint report as plain text."""
        
        text = f"""
∞ HEADY CHECKPOINT REPORT ∞
Sacred Geometry :: Organic Systems :: Breathing Interfaces

═══════════════════════════════════════════════════════════════

📊 HEADY REGISTRY SYSTEM STATUS

Total Capabilities: {registry_status.get('total_capabilities', 0)}
Nodes: {registry_status.get('nodes', 0)}
Workflows: {registry_status.get('workflows', 0)}
Services: {registry_status.get('services', 0)}
Tools: {registry_status.get('tools', 0)}
"""
        
        if sync_data:
            text += f"""
═══════════════════════════════════════════════════════════════

🔄 SYNC OPERATION

Status: {sync_data.get('status', 'unknown').upper()}
Event: {sync_data.get('event', 'N/A')}
Timestamp: {sync_data.get('timestamp', 'N/A')}
"""
            if sync_data.get('data', {}).get('hash'):
                text += f"Commit: {sync_data['data']['hash']}\n"
            if sync_data.get('data', {}).get('duration_seconds'):
                text += f"Duration: {sync_data['data']['duration_seconds']}s\n"
        
        text += f"""
═══════════════════════════════════════════════════════════════

🎯 ACTIVE CAPABILITIES

Nodes: {', '.join(registry_status.get('node_list', [])[:10])}
Workflows: {', '.join(registry_status.get('workflow_list', []))}

═══════════════════════════════════════════════════════════════

∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞
Generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        return text
    
    def _format_sync_complete_html(self, sync_data: Dict[str, Any]) -> str:
        """Format sync completion as HTML."""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #10b981;">✓ Heady Sync Complete</h2>
            <p><strong>Status:</strong> SUCCESS</p>
            <p><strong>Duration:</strong> {sync_data.get('duration_seconds', 'N/A')}s</p>
            <p><strong>Timestamp:</strong> {sync_data.get('timestamp', 'N/A')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞</p>
        </body>
        </html>
        """
    
    def _format_sync_complete_text(self, sync_data: Dict[str, Any]) -> str:
        """Format sync completion as plain text."""
        return f"""
✓ HEADY SYNC COMPLETE

Status: SUCCESS
Duration: {sync_data.get('duration_seconds', 'N/A')}s
Timestamp: {sync_data.get('timestamp', 'N/A')}

∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞
"""
    
    def _format_error_html(self, error_data: Dict[str, Any]) -> str:
        """Format error report as HTML."""
        return f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #ef4444;">✗ Heady Error Alert</h2>
            <p><strong>Error:</strong> {error_data.get('error', 'Unknown error')}</p>
            <p><strong>Timestamp:</strong> {error_data.get('timestamp', 'N/A')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞</p>
        </body>
        </html>
        """
    
    def _format_error_text(self, error_data: Dict[str, Any]) -> str:
        """Format error report as plain text."""
        return f"""
✗ HEADY ERROR ALERT

Error: {error_data.get('error', 'Unknown error')}
Timestamp: {error_data.get('timestamp', 'N/A')}

∞ HEADY SYSTEMS :: SACRED GEOMETRY ∞
"""
    
    def _send_email(self, subject: str, html_body: str, text_body: str) -> bool:
        """Send email using SMTP."""
        
        smtp_user = self.config.get("smtp_user")
        smtp_password = self.config.get("smtp_password")
        
        if not smtp_user or not smtp_password:
            print("⚠ HeadyNotifier: SMTP credentials not configured")
            print("  Set HEADY_SMTP_USER and HEADY_SMTP_PASSWORD environment variables")
            return False
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.config.get("from_email")
            msg['To'] = self.config.get("to_email")
            
            # Attach both plain text and HTML versions
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.config.get("smtp_server"), self.config.get("smtp_port")) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.send_message(msg)
            
            print(f"✓ HeadyNotifier: Email sent to {self.config.get('to_email')}")
            return True
            
        except Exception as e:
            print(f"✗ HeadyNotifier: Failed to send email: {e}")
            return False


if __name__ == "__main__":
    notifier = HeadyNotifier()
    
    # Test with sample data
    test_registry = {
        "total_capabilities": 50,
        "nodes": 19,
        "workflows": 7,
        "services": 6,
        "tools": 21,
        "node_list": ["LENS", "MEMORY", "BRAIN", "CONDUCTOR"],
        "workflow_list": ["hcautobuild", "deploy-system", "heady-sync"]
    }
    
    test_sync = {
        "event": "sync_complete",
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "data": {
            "hash": "abc123",
            "duration_seconds": 15.3
        }
    }
    
    print("\n" + "="*80)
    print("∞ HEADY NOTIFIER - TEST MODE ∞")
    print("="*80)
    print("\nConfiguration:")
    print(f"  SMTP Server: {notifier.config.get('smtp_server')}")
    print(f"  From: {notifier.config.get('from_email')}")
    print(f"  To: {notifier.config.get('to_email')}")
    print(f"  Enabled: {notifier.config.get('enabled')}")
    
    # Uncomment to test email sending
    # notifier.send_checkpoint_report(test_registry, test_sync)
