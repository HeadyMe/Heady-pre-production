# HEADY_BRAND:BEGIN
# ╔══════════════════════════════════════════════════════════════════╗
# ║  █╗  █╗███████╗ █████╗ ██████╗ █╗   █╗                     ║
# ║  █║  █║█╔════╝█╔══█╗█╔══█╗╚█╗ █╔╝                     ║
# ║  ███████║█████╗  ███████║█║  █║ ╚████╔╝                      ║
# ║  █╔══█║█╔══╝  █╔══█║█║  █║  ╚█╔╝                       ║
# ║  █║  █║███████╗█║  █║██████╔╝   █║                        ║
# ║  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝                        ║
# ║                                                                  ║
# ║  ∞ SACRED GEOMETRY ∞  Organic Systems · Breathing Interfaces    ║
# ║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
# ║  FILE: HeadyAcademy/Tools/Security/MCP_Auth.py                    ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
MCP_Auth.py - MCP Server/Client Authentication
Handles authentication for Model Context Protocol servers and clients.
"""
import os
import json
import time
import hashlib
import secrets
import asyncio
import websockets
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Optional, Any

VAULT_DIR = Path(__file__).parent.parent.parent / "Vault"
MCP_CONFIG = VAULT_DIR / "mcp_config.json"
MCP_KEYS = VAULT_DIR / "mcp_keys.json"

class MCPAuthManager:
    """Manages authentication for MCP servers and clients."""
    
    def __init__(self, master_key=None):
        self.master_key = master_key or os.environ.get("HEADY_MCP_KEY")
        self.config = {}
        self.server_keys = {}
        self.client_sessions = {}
        self._initialize()
    
    def _initialize(self):
        """Initialize MCP authentication system."""
        VAULT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load configuration
        if MCP_CONFIG.exists():
            with open(MCP_CONFIG, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = self._default_config()
            self._save_config()
        
        # Load server keys
        if MCP_KEYS.exists():
            with open(MCP_KEYS, 'r') as f:
                self.server_keys = json.load(f)
    
    def _default_config(self):
        """Default MCP configuration."""
        return {
            "servers": {
                "heady_bridge": {
                    "host": "localhost",
                    "port": 8080,
                    "auth_type": "bearer",
                    "timeout": 30,
                    "max_connections": 10
                },
                "heady_nova": {
                    "host": "localhost", 
                    "port": 8081,
                    "auth_type": "api_key",
                    "timeout": 30,
                    "max_connections": 5
                },
                "heady_oculus": {
                    "host": "localhost",
                    "port": 8082,
                    "auth_type": "jwt",
                    "timeout": 30,
                    "max_connections": 3
                }
            },
            "clients": {
                "heady_master": {
                    "permissions": ["read", "write", "admin"],
                    "auto_reconnect": True,
                    "heartbeat_interval": 30
                },
                "heady_scout": {
                    "permissions": ["read"],
                    "auto_reconnect": True,
                    "heartbeat_interval": 60
                }
            },
            "security": {
                "token_expiry": 3600,
                "session_timeout": 7200,
                "max_failed_attempts": 5,
                "lockout_duration": 300
            }
        }
    
    def generate_server_key(self, server_name: str) -> str:
        """Generate authentication key for MCP server."""
        if server_name not in self.config["servers"]:
            raise ValueError(f"Unknown server: {server_name}")
        
        # Generate unique key
        key = secrets.token_urlsafe(32)
        key_hash = hashlib.sha256(key.encode()).hexdigest()
        
        # Store server key info
        self.server_keys[server_name] = {
            "key": key,
            "hash": key_hash,
            "generated": datetime.now().isoformat(),
            "auth_type": self.config["servers"][server_name]["auth_type"],
            "last_used": None
        }
        
        self._save_server_keys()
        return key
    
    def generate_client_token(self, client_id: str, server_name: str, permissions: list = None) -> Dict[str, Any]:
        """Generate authentication token for MCP client."""
        if server_name not in self.config["servers"]:
            raise ValueError(f"Unknown server: {server_name}")
        
        if client_id not in self.config["clients"]:
            raise ValueError(f"Unknown client: {client_id}")
        
        server_config = self.config["servers"][server_name]
        client_config = self.config["clients"][client_id]
        
        # Generate token based on auth type
        if server_config["auth_type"] == "bearer":
            token = secrets.token_urlsafe(32)
            auth_data = {
                "type": "bearer",
                "token": token,
                "expires": (datetime.now() + timedelta(seconds=self.config["security"]["token_expiry"])).isoformat()
            }
        
        elif server_config["auth_type"] == "api_key":
            timestamp = str(int(time.time()))
            message = f"{client_id}:{server_name}:{timestamp}"
            signature = hashlib.sha256((message + self.master_key).encode()).hexdigest()
            
            auth_data = {
                "type": "api_key",
                "signature": signature,
                "timestamp": timestamp,
                "client_id": client_id
            }
        
        elif server_config["auth_type"] == "jwt":
            import jwt
            payload = {
                "client_id": client_id,
                "server": server_name,
                "permissions": permissions or client_config["permissions"],
                "iat": datetime.utcnow(),
                "exp": datetime.utcnow() + timedelta(seconds=self.config["security"]["token_expiry"])
            }
            token = jwt.encode(payload, self.master_key, algorithm="HS256")
            
            auth_data = {
                "type": "jwt",
                "token": token,
                "expires": payload["exp"]
            }
        
        else:
            raise ValueError(f"Unsupported auth type: {server_config['auth_type']}")
        
        # Store session
        session_id = secrets.token_urlsafe(16)
        self.client_sessions[session_id] = {
            "client_id": client_id,
            "server": server_name,
            "auth_data": auth_data,
            "created": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
            "active": True
        }
        
        return {
            "session_id": session_id,
            "auth_data": auth_data,
            "server_config": {
                "host": server_config["host"],
                "port": server_config["port"],
                "timeout": server_config["timeout"]
            }
        }
    
    def validate_server_connection(self, server_name: str, auth_data: Dict[str, Any]) -> bool:
        """Validate server connection authentication."""
        if server_name not in self.server_keys:
            return False
        
        server_key = self.server_keys[server_name]
        auth_type = server_key["auth_type"]
        
        if auth_type == "bearer":
            token = auth_data.get("token")
            if not token:
                return False
            
            # Check if token matches stored key
            return token == server_key["key"]
        
        elif auth_type == "api_key":
            signature = auth_data.get("signature")
            timestamp = auth_data.get("timestamp")
            client_id = auth_data.get("client_id")
            
            if not all([signature, timestamp, client_id]):
                return False
            
            # Verify signature
            message = f"{client_id}:{server_name}:{timestamp}"
            expected_signature = hashlib.sha256((message + self.master_key).encode()).hexdigest()
            
            # Check timestamp (prevent replay attacks)
            current_time = int(time.time())
            request_time = int(timestamp)
            if abs(current_time - request_time) > 300:  # 5 minute window
                return False
            
            return signature == expected_signature
        
        elif auth_type == "jwt":
            import jwt
            token = auth_data.get("token")
            if not token:
                return False
            
            try:
                payload = jwt.decode(token, self.master_key, algorithms=["HS256"])
                return payload.get("server") == server_name
            except jwt.InvalidTokenError:
                return False
        
        return False
    
    def validate_client_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Validate client session."""
        if session_id not in self.client_sessions:
            return None
        
        session = self.client_sessions[session_id]
        
        # Check if session is active
        if not session["active"]:
            return None
        
        # Check session timeout
        last_activity = datetime.fromisoformat(session["last_activity"])
        if datetime.now() - last_activity > timedelta(seconds=self.config["security"]["session_timeout"]):
            session["active"] = False
            return None
        
        # Update last activity
        session["last_activity"] = datetime.now().isoformat()
        self._save_sessions()
        
        return session
    
    async def authenticate_websocket(self, websocket, server_name: str) -> Optional[str]:
        """Authenticate WebSocket connection for MCP server."""
        try:
            # Wait for authentication message
            auth_message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
            auth_data = json.loads(auth_message)
            
            if self.validate_server_connection(server_name, auth_data):
                # Generate session ID
                session_id = secrets.token_urlsafe(16)
                self.client_sessions[session_id] = {
                    "server": server_name,
                    "websocket": websocket,
                    "created": datetime.now().isoformat(),
                    "last_activity": datetime.now().isoformat(),
                    "active": True
                }
                
                # Send success response
                await websocket.send(json.dumps({
                    "type": "auth_success",
                    "session_id": session_id
                }))
                
                return session_id
            else:
                await websocket.send(json.dumps({
                    "type": "auth_error",
                    "message": "Invalid authentication"
                }))
                return None
        
        except asyncio.TimeoutError:
            await websocket.send(json.dumps({
                "type": "auth_error",
                "message": "Authentication timeout"
            }))
            return None
        except Exception as e:
            print(f"WebSocket auth error: {e}")
            return None
    
    def revoke_session(self, session_id: str) -> bool:
        """Revoke client session."""
        if session_id in self.client_sessions:
            self.client_sessions[session_id]["active"] = False
            self._save_sessions()
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions."""
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session in self.client_sessions.items():
            if not session["active"]:
                expired_sessions.append(session_id)
                continue
            
            last_activity = datetime.fromisoformat(session["last_activity"])
            if current_time - last_activity > timedelta(seconds=self.config["security"]["session_timeout"]):
                session["active"] = False
                expired_sessions.append(session_id)
        
        # Remove expired sessions
        for session_id in expired_sessions:
            del self.client_sessions[session_id]
        
        if expired_sessions:
            self._save_sessions()
        
        return len(expired_sessions)
    
    def get_server_status(self, server_name: str) -> Dict[str, Any]:
        """Get server authentication status."""
        if server_name not in self.config["servers"]:
            return {"status": "unknown", "message": "Server not configured"}
        
        if server_name not in self.server_keys:
            return {"status": "not_configured", "message": "Server key not generated"}
        
        server_key = self.server_keys[server_name]
        active_sessions = sum(1 for s in self.client_sessions.values() if s["server"] == server_name and s["active"])
        
        return {
            "status": "active",
            "configured": True,
            "auth_type": server_key["auth_type"],
            "generated": server_key["generated"],
            "last_used": server_key["last_used"],
            "active_sessions": active_sessions
        }
    
    def _save_config(self):
        """Save configuration to file."""
        with open(MCP_CONFIG, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def _save_server_keys(self):
        """Save server keys to file."""
        with open(MCP_KEYS, 'w') as f:
            json.dump(self.server_keys, f, indent=2)
    
    def _save_sessions(self):
        """Save sessions to file."""
        sessions_file = VAULT_DIR / "mcp_sessions.json"
        with open(sessions_file, 'w') as f:
            json.dump(self.client_sessions, f, indent=2)

def main():
    """Command line interface for MCP authentication."""
    import argparse
    
    parser = argparse.ArgumentParser(description="MCP Authentication Manager")
    parser.add_argument("action", choices=["server_key", "client_token", "status", "cleanup"])
    parser.add_argument("--server", help="Server name")
    parser.add_argument("--client", help="Client ID")
    parser.add_argument("--permissions", help="Client permissions (comma-separated)")
    
    args = parser.parse_args()
    
    try:
        mcp_auth = MCPAuthManager()
        
        if args.action == "server_key":
            if not args.server:
                print("Error: --server required")
                return
            key = mcp_auth.generate_server_key(args.server)
            print(f"Server key for {args.server}: {key}")
        
        elif args.action == "client_token":
            if not args.server or not args.client:
                print("Error: --server and --client required")
                return
            
            permissions = args.permissions.split(",") if args.permissions else None
            token_data = mcp_auth.generate_client_token(args.client, args.server, permissions)
            print(f"Client token: {json.dumps(token_data, indent=2)}")
        
        elif args.action == "status":
            if args.server:
                status = mcp_auth.get_server_status(args.server)
                print(f"Server status: {json.dumps(status, indent=2)}")
            else:
                print("Available servers:")
                for server in mcp_auth.config["servers"]:
                    status = mcp_auth.get_server_status(server)
                    print(f"  {server}: {status['status']}")
        
        elif args.action == "cleanup":
            cleaned = mcp_auth.cleanup_expired_sessions()
            print(f"Cleaned up {cleaned} expired sessions")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
