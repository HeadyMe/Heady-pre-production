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
# ║  FILE: HeadyAcademy/Tools/Security/Key_Manager.py                 ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Key_Manager.py - Comprehensive API Key Management System
Handles secure storage, rotation, and access control for all API keys and credentials.
"""
import os
import json
import hashlib
import secrets
import base64
from pathlib import Path
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

VAULT_DIR = Path(__file__).parent.parent.parent / "Vault"
KEYS_FILE = VAULT_DIR / "keys.encrypted"
CONFIG_FILE = VAULT_DIR / "key_config.json"

# API Key configurations for different services
API_CONFIGS = {
    "gemini": {
        "service": "Google Gemini AI",
        "url": "https://generativelanguage.googleapis.com",
        "auth_type": "api_key",
        "rotation_days": 90,
        "required_for": ["Sasha", "Content_Generator"]
    },
    "openai": {
        "service": "OpenAI",
        "url": "https://api.openai.com",
        "auth_type": "bearer",
        "rotation_days": 60,
        "required_for": ["Content_Generator", "Brainstorm"]
    },
    "yandex": {
        "service": "Yandex GPT",
        "url": "https://api.yandex.cloud",
        "auth_type": "iam_token",
        "rotation_days": 30,
        "required_for": ["Sasha"]
    },
    "github": {
        "service": "GitHub",
        "url": "https://api.github.com",
        "auth_type": "token",
        "rotation_days": 180,
        "required_for": ["Scout"]
    },
    "cloudflare": {
        "service": "Cloudflare",
        "url": "https://api.cloudflare.com",
        "auth_type": "api_token",
        "rotation_days": 90,
        "required_for": ["Bridge"]
    },
    "anthropic": {
        "service": "Anthropic Claude",
        "url": "https://api.anthropic.com",
        "auth_type": "api_key",
        "rotation_days": 90,
        "required_for": ["Content_Generator"]
    },
    "huggingface": {
        "service": "Hugging Face",
        "url": "https://api-inference.huggingface.co",
        "auth_type": "api_key",
        "rotation_days": 120,
        "required_for": ["Content_Generator"]
    }
}

class KeyManager:
    def __init__(self, master_password=None):
        self.master_password = master_password or os.environ.get("HEADY_MASTER_KEY")
        self.fernet = None
        self.keys = {}
        self.config = {}
        self._initialize()
    
    def _initialize(self):
        """Initialize encryption and load existing keys."""
        VAULT_DIR.mkdir(parents=True, exist_ok=True)
        
        if not self.master_password:
            raise ValueError("Master password required. Set HEADY_MASTER_KEY environment variable.")
        
        # Derive encryption key from master password
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b'heady_salt_2024',
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(self.master_password.encode()))
        self.fernet = Fernet(key)
        
        # Load existing configuration
        if CONFIG_FILE.exists():
            with open(CONFIG_FILE, 'r') as f:
                self.config = json.load(f)
        
        # Load encrypted keys
        if KEYS_FILE.exists():
            with open(KEYS_FILE, 'rb') as f:
                encrypted_data = f.read()
                decrypted_data = self.fernet.decrypt(encrypted_data)
                self.keys = json.loads(decrypted_data.decode())
    
    def add_key(self, service_name, api_key, description=""):
        """Add or update an API key."""
        if service_name not in API_CONFIGS:
            raise ValueError(f"Unknown service: {service_name}")
        
        # Validate key format
        config = API_CONFIGS[service_name]
        if not self._validate_key_format(api_key, config["auth_type"]):
            raise ValueError(f"Invalid key format for {service_name}")
        
        # Store encrypted key
        key_data = {
            "key": api_key,
            "added": datetime.now().isoformat(),
            "last_rotated": datetime.now().isoformat(),
            "description": description,
            "service": config["service"],
            "auth_type": config["auth_type"]
        }
        
        self.keys[service_name] = key_data
        self._save_keys()
        
        # Update configuration
        self.config[service_name] = {
            "enabled": True,
            "rotation_days": config["rotation_days"],
            "required_for": config["required_for"]
        }
        self._save_config()
        
        print(f"✅ Added key for {config['service']}")
        return True
    
    def get_key(self, service_name):
        """Retrieve API key for a service."""
        if service_name not in self.keys:
            raise ValueError(f"No key found for {service_name}")
        
        key_data = self.keys[service_name]
        
        # Check if key needs rotation
        last_rotated = datetime.fromisoformat(key_data["last_rotated"])
        if datetime.now() > last_rotated + timedelta(days=self.config[service_name]["rotation_days"]):
            print(f"⚠️  Key for {service_name} needs rotation")
        
        return key_data["key"]
    
    def rotate_key(self, service_name, new_key):
        """Rotate an existing API key."""
        if service_name not in self.keys:
            raise ValueError(f"No existing key for {service_name}")
        
        old_key = self.keys[service_name]
        self.keys[service_name]["key"] = new_key
        self.keys[service_name]["last_rotated"] = datetime.now().isoformat()
        self.keys[service_name]["previous_key"] = old_key["key"]
        
        self._save_keys()
        print(f"🔄 Rotated key for {API_CONFIGS[service_name]['service']}")
        return True
    
    def list_keys(self):
        """List all stored keys (without showing actual keys)."""
        print("\n🔑 Stored API Keys:")
        print("-" * 50)
        
        for service, key_data in self.keys.items():
            config = API_CONFIGS.get(service, {})
            last_rotated = datetime.fromisoformat(key_data["last_rotated"])
            days_old = (datetime.now() - last_rotated).days
            
            status = "✅" if days_old < config.get("rotation_days", 90) else "⚠️"
            print(f"{status} {service.upper():12} | {key_data['service']:20} | {days_old:3} days old")
            if key_data.get("description"):
                print(f"    └─ {key_data['description']}")
    
    def validate_all_keys(self):
        """Validate all stored API keys."""
        print("\n🔍 Validating API Keys...")
        valid_count = 0
        
        for service, key_data in self.keys.items():
            config = API_CONFIGS.get(service, {})
            if self._test_key(service, key_data["key"], config):
                print(f"✅ {service}: Valid")
                valid_count += 1
            else:
                print(f"❌ {service}: Invalid or expired")
        
        print(f"\nValidation complete: {valid_count}/{len(self.keys)} keys valid")
        return valid_count == len(self.keys)
    
    def generate_env_file(self, output_path=None):
        """Generate .env file with all keys."""
        if not output_path:
            output_path = VAULT_DIR / ".env"
        
        env_content = [
            "# Heady Academy API Keys",
            f"# Generated: {datetime.now().isoformat()}",
            "# DO NOT COMMIT TO VERSION CONTROL",
            ""
        ]
        
        for service, key_data in self.keys.items():
            env_key = f"{service.upper()}_API_KEY"
            env_content.append(f"{env_key}={key_data['key']}")
        
        with open(output_path, 'w') as f:
            f.write('\n'.join(env_content))
        
        print(f"📝 Generated .env file: {output_path}")
        return str(output_path)
    
    def _validate_key_format(self, key, auth_type):
        """Validate key format based on authentication type."""
        if not key or len(key) < 10:
            return False
        
        if auth_type == "api_key":
            return len(key) >= 20 and key.replace('-', '').replace('_', '').isalnum()
        elif auth_type == "bearer":
            return key.startswith('sk-') and len(key) >= 40
        elif auth_type == "token":
            return key.startswith('ghp_') or key.startswith('gho_') or len(key) >= 40
        elif auth_type == "iam_token":
            return len(key) >= 100
        
        return True
    
    def _test_key(self, service, key, config):
        """Test if API key is valid (simplified validation)."""
        # This would make actual API calls in production
        # For now, just check format and age
        return self._validate_key_format(key, config.get("auth_type", "api_key"))
    
    def _save_keys(self):
        """Save encrypted keys to file."""
        encrypted_data = self.fernet.encrypt(json.dumps(self.keys).encode())
        with open(KEYS_FILE, 'wb') as f:
            f.write(encrypted_data)
    
    def _save_config(self):
        """Save configuration to file."""
        with open(CONFIG_FILE, 'w') as f:
            json.dump(self.config, f, indent=2)

def main():
    """Command line interface for key management."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Heady Academy Key Manager")
    parser.add_argument("action", choices=["add", "list", "validate", "rotate", "env"])
    parser.add_argument("--service", help="Service name")
    parser.add_argument("--key", help="API key")
    parser.add_argument("--description", help="Key description")
    parser.add_argument("--output", help="Output file for env generation")
    
    args = parser.parse_args()
    
    try:
        km = KeyManager()
        
        if args.action == "add":
            if not args.service or not args.key:
                print("Error: --service and --key required for add action")
                return
            km.add_key(args.service, args.key, args.description or "")
        
        elif args.action == "list":
            km.list_keys()
        
        elif args.action == "validate":
            km.validate_all_keys()
        
        elif args.action == "rotate":
            if not args.service or not args.key:
                print("Error: --service and --key required for rotate action")
                return
            km.rotate_key(args.service, args.key)
        
        elif args.action == "env":
            km.generate_env_file(args.output)
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
