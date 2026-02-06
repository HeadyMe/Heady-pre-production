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
# ║  FILE: HeadyAcademy/Tools/Security/Auth_Protocol.py               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Auth_Protocol.py - Authorization Protocol Framework
Implements OAuth2, JWT, and custom authentication for Heady Academy services.
"""
import os
import json
import time
import jwt
import hashlib
import secrets
import requests
from pathlib import Path
from datetime import datetime, timedelta
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

VAULT_DIR = Path(__file__).parent.parent.parent / "Vault"
TOKEN_FILE = VAULT_DIR / "tokens.json"
AUTH_CONFIG = VAULT_DIR / "auth_config.json"

class AuthProtocol:
    """Main authentication protocol handler."""
    
    def __init__(self, master_key=None):
        self.master_key = master_key or os.environ.get("HEADY_SIGNATURE_KEY")
        self.tokens = {}
        self.config = {}
        self._initialize()
    
    def _initialize(self):
        """Initialize authentication system."""
        VAULT_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load existing tokens
        if TOKEN_FILE.exists():
            with open(TOKEN_FILE, 'r') as f:
                self.tokens = json.load(f)
        
        # Load auth configuration
        if AUTH_CONFIG.exists():
            with open(AUTH_CONFIG, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = self._default_config()
            self._save_config()
    
    def _default_config(self):
        """Default authentication configuration."""
        return {
            "jwt_algorithm": "HS256",
            "token_expiry": 3600,  # 1 hour
            "refresh_expiry": 86400,  # 24 hours
            "oauth_providers": {
                "github": {
                    "auth_url": "https://github.com/login/oauth/authorize",
                    "token_url": "https://github.com/login/oauth/access_token",
                    "scope": "repo:status read:org"
                },
                "google": {
                    "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
                    "token_url": "https://oauth2.googleapis.com/token",
                    "scope": "openid email profile"
                }
            },
            "mcp_servers": {
                "heady_bridge": {
                    "auth_type": "bearer",
                    "token_endpoint": "/auth/token"
                },
                "heady_nova": {
                    "auth_type": "api_key",
                    "token_endpoint": "/api/validate"
                }
            }
        }
    
    def generate_jwt_token(self, user_id, permissions=None, expires_in=None):
        """Generate JWT token for user."""
        if not self.master_key:
            raise ValueError("Master key required for JWT generation")
        
        payload = {
            "user_id": user_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(seconds=expires_in or self.config["token_expiry"]),
            "permissions": permissions or ["read", "write"],
            "iss": "heady_academy"
        }
        
        token = jwt.encode(payload, self.master_key, algorithm=self.config["jwt_algorithm"])
        
        # Store token info
        token_info = {
            "user_id": user_id,
            "generated": datetime.now().isoformat(),
            "expires": (datetime.now() + timedelta(seconds=expires_in or self.config["token_expiry"])).isoformat(),
            "permissions": permissions or ["read", "write"]
        }
        self.tokens[f"jwt_{user_id}"] = token_info
        self._save_tokens()
        
        return token
    
    def validate_jwt_token(self, token):
        """Validate JWT token."""
        try:
            payload = jwt.decode(token, self.master_key, algorithms=[self.config["jwt_algorithm"]])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Token expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
    
    def generate_oauth_url(self, provider, redirect_uri, state=None):
        """Generate OAuth authorization URL."""
        if provider not in self.config["oauth_providers"]:
            raise ValueError(f"Unsupported OAuth provider: {provider}")
        
        provider_config = self.config["oauth_providers"][provider]
        client_id = os.environ.get(f"{provider.upper()}_CLIENT_ID")
        
        if not client_id:
            raise ValueError(f"Client ID not configured for {provider}")
        
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": provider_config["scope"],
            "response_type": "code",
            "state": state or secrets.token_urlsafe(16)
        }
        
        auth_url = f"{provider_config['auth_url']}?" + "&".join([f"{k}={v}" for k, v in params.items()])
        return auth_url, params["state"]
    
    def exchange_oauth_code(self, provider, code, redirect_uri):
        """Exchange OAuth code for access token."""
        if provider not in self.config["oauth_providers"]:
            raise ValueError(f"Unsupported OAuth provider: {provider}")
        
        provider_config = self.config["oauth_providers"][provider]
        client_id = os.environ.get(f"{provider.upper()}_CLIENT_ID")
        client_secret = os.environ.get(f"{provider.upper()}_CLIENT_SECRET")
        
        if not client_id or not client_secret:
            raise ValueError(f"Client credentials not configured for {provider}")
        
        data = {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri
        }
        
        response = requests.post(provider_config["token_url"], data=data)
        if response.status_code != 200:
            raise ValueError(f"OAuth token exchange failed: {response.text}")
        
        token_data = response.json()
        
        # Store token
        self.tokens[f"oauth_{provider}"] = {
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
            "expires_in": token_data.get("expires_in"),
            "generated": datetime.now().isoformat()
        }
        self._save_tokens()
        
        return token_data
    
    def generate_mcp_auth(self, server_name, method="bearer"):
        """Generate authentication for MCP servers."""
        if server_name not in self.config["mcp_servers"]:
            raise ValueError(f"Unknown MCP server: {server_name}")
        
        server_config = self.config["mcp_servers"][server_name]
        
        if method == "bearer":
            # Generate bearer token
            token = secrets.token_urlsafe(32)
            expiry = datetime.now() + timedelta(hours=1)
            
            self.tokens[f"mcp_{server_name}"] = {
                "token": token,
                "method": "bearer",
                "expires": expiry.isoformat(),
                "generated": datetime.now().isoformat()
            }
            
            return {"Authorization": f"Bearer {token}"}
        
        elif method == "api_key":
            # Generate API key signature
            timestamp = str(int(time.time()))
            message = f"{server_name}:{timestamp}"
            signature = hashlib.sha256((message + self.master_key).encode()).hexdigest()
            
            return {
                "X-API-Key": signature,
                "X-Timestamp": timestamp,
                "X-Server": server_name
            }
    
    def validate_mcp_auth(self, server_name, headers):
        """Validate MCP server authentication."""
        if server_name not in self.config["mcp_servers"]:
            return False
        
        server_config = self.config["mcp_servers"][server_name]
        
        if server_config["auth_type"] == "bearer":
            auth_header = headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return False
            
            token = auth_header[7:]
            stored_token = self.tokens.get(f"mcp_{server_name}", {}).get("token")
            
            if token == stored_token:
                # Check expiry
                expires = datetime.fromisoformat(self.tokens[f"mcp_{server_name}"]["expires"])
                return datetime.now() < expires
        
        elif server_config["auth_type"] == "api_key":
            api_key = headers.get("X-API-Key")
            timestamp = headers.get("X-Timestamp")
            server = headers.get("X-Server")
            
            if not all([api_key, timestamp, server]):
                return False
            
            # Verify signature
            message = f"{server}:{timestamp}"
            expected_signature = hashlib.sha256((message + self.master_key).encode()).hexdigest()
            
            return api_key == expected_signature
        
        return False
    
    def rotate_tokens(self, user_id=None):
        """Rotate tokens for user or all users."""
        if user_id:
            # Rotate specific user's tokens
            for key in list(self.tokens.keys()):
                if key.startswith(f"jwt_{user_id}"):
                    del self.tokens[key]
        else:
            # Rotate all expired tokens
            current_time = datetime.now()
            expired_keys = []
            
            for key, token_info in self.tokens.items():
                if "expires" in token_info:
                    expires = datetime.fromisoformat(token_info["expires"])
                    if current_time >= expires:
                        expired_keys.append(key)
            
            for key in expired_keys:
                del self.tokens[key]
        
        self._save_tokens()
        return True
    
    def get_active_tokens(self):
        """Get list of active tokens."""
        active = {}
        current_time = datetime.now()
        
        for key, token_info in self.tokens.items():
            if "expires" in token_info:
                expires = datetime.fromisoformat(token_info["expires"])
                if current_time < expires:
                    active[key] = token_info
            else:
                active[key] = token_info
        
        return active
    
    def revoke_token(self, token_id):
        """Revoke a specific token."""
        if token_id in self.tokens:
            del self.tokens[token_id]
            self._save_tokens()
            return True
        return False
    
    def _save_tokens(self):
        """Save tokens to file."""
        with open(TOKEN_FILE, 'w') as f:
            json.dump(self.tokens, f, indent=2)
    
    def _save_config(self):
        """Save configuration to file."""
        with open(AUTH_CONFIG, 'w') as f:
            json.dump(self.config, f, indent=2)

def main():
    """Command line interface for auth management."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Heady Academy Auth Protocol")
    parser.add_argument("action", choices=["jwt", "oauth", "mcp", "validate", "rotate", "list"])
    parser.add_argument("--user", help="User ID")
    parser.add_argument("--server", help="MCP server name")
    parser.add_argument("--provider", help="OAuth provider")
    parser.add_argument("--token", help="Token to validate")
    
    args = parser.parse_args()
    
    try:
        auth = AuthProtocol()
        
        if args.action == "jwt":
            if not args.user:
                print("Error: --user required for JWT generation")
                return
            token = auth.generate_jwt_token(args.user)
            print(f"JWT Token: {token}")
        
        elif args.action == "oauth":
            if not args.provider:
                print("Error: --provider required for OAuth")
                return
            url, state = auth.generate_oauth_url(args.provider, "http://localhost:8080/callback")
            print(f"OAuth URL: {url}")
            print(f"State: {state}")
        
        elif args.action == "mcp":
            if not args.server:
                print("Error: --server required for MCP auth")
                return
            headers = auth.generate_mcp_auth(args.server)
            print(f"MCP Headers: {headers}")
        
        elif args.action == "validate":
            if not args.token:
                print("Error: --token required for validation")
                return
            payload = auth.validate_jwt_token(args.token)
            print(f"Valid payload: {payload}")
        
        elif args.action == "rotate":
            auth.rotate_tokens(args.user)
            print("Tokens rotated")
        
        elif args.action == "list":
            active = auth.get_active_tokens()
            print(f"Active tokens: {len(active)}")
            for key, info in active.items():
                print(f"  {key}: {info.get('user_id', 'N/A')} - {info.get('expires', 'No expiry')}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
