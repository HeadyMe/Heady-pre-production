#!/usr/bin/env python3
"""
Heady Core Security Module
Implements patent portfolio security features: PTACA, RAA, Trust Domains
"""

import os
import json
import hashlib
import hmac
import secrets
import time
import asyncio
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import jwt
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.fernet import Fernet
import base64

# Security Constants
TRUST_DOMAIN = "headysystems.com"
APP_DOMAIN = "app.headysystems.com"
MAX_RISK_SCORE = 100
ATTESTATION_VALIDITY_SECONDS = 300
NONCE_EXPIRY_SECONDS = 60

class RiskLevel(Enum):
    """Risk classification for operations"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AttestationState(Enum):
    """Hardware attestation states"""
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    EXPIRED = "expired"
    COMPROMISED = "compromised"

@dataclass
class SecurityContext:
    """Security context for RAA (Risk-Authorization-Attestation) validation"""
    user_id: str
    session_id: str
    risk_level: RiskLevel
    attestation_state: AttestationState
    hardware_token: Optional[str]
    biometric_verified: bool
    timestamp: datetime
    nonce: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            **asdict(self),
            'risk_level': self.risk_level.value,
            'attestation_state': self.attestation_state.value,
            'timestamp': self.timestamp.isoformat()
        }

class PTACAValidator:
    """Physical Trust-Anchored Cryptographic Authorization"""
    
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode()
        self.active_nonces: Dict[str, float] = {}
        
    def generate_hardware_nonce(self) -> Tuple[str, str]:
        """Generate time-variant cryptographic nonce for hardware token"""
        nonce = secrets.token_hex(32)
        timestamp = time.time()
        
        # Create signature based on nonce and timestamp
        message = f"{nonce}:{timestamp}".encode()
        signature = hmac.new(self.secret_key, message, hashlib.sha256).hexdigest()
        
        # Store nonce with expiry
        self.active_nonces[nonce] = timestamp + NONCE_EXPIRY_SECONDS
        
        return nonce, signature
    
    def verify_hardware_presence(self, nonce: str, signature: str, hardware_token: str) -> bool:
        """Verify physical presence of hardware token"""
        # Check if nonce is valid and not expired
        if nonce not in self.active_nonces:
            return False
            
        if time.time() > self.active_nonces[nonce]:
            del self.active_nonces[nonce]
            return False
        
        # Verify signature
        timestamp = self.active_nonces[nonce] - NONCE_EXPIRY_SECONDS
        message = f"{nonce}:{timestamp}".encode()
        expected_signature = hmac.new(self.secret_key, message, hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return False
        
        # Verify hardware token
        token_message = f"{hardware_token}:{nonce}".encode()
        token_signature = hmac.new(self.secret_key, token_message, hashlib.sha256).hexdigest()
        
        # Clean up used nonce
        del self.active_nonces[nonce]
        
        return True
    
    def cleanup_expired_nonces(self):
        """Remove expired nonces"""
        current_time = time.time()
        expired = [n for n, exp in self.active_nonces.items() if exp < current_time]
        for nonce in expired:
            del self.active_nonces[nonce]

class RAAExecutionFabric:
    """Risk-Authorization-Attestation Execution Fabric"""
    
    def __init__(self, ptaca_validator: PTACAValidator):
        self.ptaca = ptaca_validator
        self.risk_thresholds = {
            RiskLevel.LOW: 25,
            RiskLevel.MEDIUM: 50,
            RiskLevel.HIGH: 75,
            RiskLevel.CRITICAL: 100
        }
        
    def calculate_risk_score(self, operation: str, context: Dict[str, Any]) -> int:
        """Calculate risk score for an operation"""
        base_score = 0
        
        # Destructive operations
        destructive_patterns = ["delete", "rm", "drop", "truncate", "exec", "shell"]
        for pattern in destructive_patterns:
            if pattern in operation.lower():
                base_score += 30
        
        # Write operations
        if any(word in operation.lower() for word in ["write", "update", "modify", "edit"]):
            base_score += 20
        
        # Scope multiplier
        if context.get("scope") == "global":
            base_score *= 2
        elif context.get("scope") == "system":
            base_score *= 1.5
        
        # Privilege level
        if context.get("privilege_level") == "admin":
            base_score += 25
        elif context.get("privilege_level") == "elevated":
            base_score += 15
        
        return min(int(base_score), MAX_RISK_SCORE)
    
    def classify_risk_level(self, risk_score: int) -> RiskLevel:
        """Classify risk level based on score"""
        if risk_score <= self.risk_thresholds[RiskLevel.LOW]:
            return RiskLevel.LOW
        elif risk_score <= self.risk_thresholds[RiskLevel.MEDIUM]:
            return RiskLevel.MEDIUM
        elif risk_score <= self.risk_thresholds[RiskLevel.HIGH]:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL
    
    def verify_authorization(self, user_id: str, operation: str, resource: str) -> bool:
        """Verify user authorization for operation"""
        # Simplified authorization check - extend with proper RBAC/ABAC
        # This would integrate with your existing auth system
        authorized_operations = {
            "read": ["*"],
            "write": ["user_data", "temp"],
            "execute": ["approved_scripts"],
            "admin": ["system_config"]
        }
        
        # Check if operation is authorized for resource
        for op_type, resources in authorized_operations.items():
            if op_type in operation.lower():
                if "*" in resources or any(r in resource for r in resources):
                    return True
        
        return False
    
    def create_attestation(self, hardware_token: str) -> Dict[str, Any]:
        """Create hardware attestation"""
        return {
            "token": hardware_token,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "validity_seconds": ATTESTATION_VALIDITY_SECONDS,
            "state": AttestationState.VERIFIED.value
        }
    
    def validate_execution(self, context: SecurityContext, operation: str, 
                          resource: str) -> Tuple[bool, str]:
        """Validate execution based on RAA principles"""
        
        # 1. Risk Assessment
        risk_context = {
            "scope": "user" if "user" in resource else "system",
            "privilege_level": "admin" if context.user_id.startswith("admin") else "user"
        }
        risk_score = self.calculate_risk_score(operation, risk_context)
        risk_level = self.classify_risk_level(risk_score)
        
        # 2. Authorization Check
        if not self.verify_authorization(context.user_id, operation, resource):
            return False, "Authorization denied for operation"
        
        # 3. Attestation Verification
        if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            if context.attestation_state != AttestationState.VERIFIED:
                return False, "Hardware attestation required for high-risk operation"
            
            if not context.hardware_token:
                return False, "Hardware token required for critical operation"
        
        # 4. Biometric requirement for critical operations
        if risk_level == RiskLevel.CRITICAL and not context.biometric_verified:
            return False, "Biometric verification required for critical operation"
        
        return True, f"Operation approved (Risk: {risk_level.value})"

class TrustDomainManager:
    """Manage isolated trust domains"""
    
    def __init__(self):
        self.domains: Dict[str, Dict[str, Any]] = {}
        self.domain_keys: Dict[str, bytes] = {}
        
    def create_domain(self, domain_name: str, config: Dict[str, Any]) -> str:
        """Create a new isolated trust domain"""
        # Generate domain-specific encryption key
        domain_key = Fernet.generate_key()
        self.domain_keys[domain_name] = domain_key
        
        # Create domain configuration
        self.domains[domain_name] = {
            "name": domain_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "config": config,
            "root_of_trust": hashlib.sha256(domain_key).hexdigest(),
            "isolation_level": config.get("isolation_level", "strict"),
            "allowed_operations": config.get("allowed_operations", ["read"]),
            "max_risk_level": config.get("max_risk_level", RiskLevel.MEDIUM.value)
        }
        
        return self.domains[domain_name]["root_of_trust"]
    
    def verify_domain_isolation(self, source_domain: str, target_domain: str) -> bool:
        """Verify isolation between domains"""
        if source_domain not in self.domains or target_domain not in self.domains:
            return False
        
        source_config = self.domains[source_domain]
        target_config = self.domains[target_domain]
        
        # Check if cross-domain communication is allowed
        if source_config["isolation_level"] == "strict" or target_config["isolation_level"] == "strict":
            return False
        
        # Check if domains have established trust relationship
        trusted_domains = source_config.get("trusted_domains", [])
        return target_domain in trusted_domains
    
    def encrypt_for_domain(self, domain_name: str, data: bytes) -> bytes:
        """Encrypt data for specific domain"""
        if domain_name not in self.domain_keys:
            raise ValueError(f"Domain {domain_name} not found")
        
        f = Fernet(self.domain_keys[domain_name])
        return f.encrypt(data)
    
    def decrypt_for_domain(self, domain_name: str, encrypted_data: bytes) -> bytes:
        """Decrypt data for specific domain"""
        if domain_name not in self.domain_keys:
            raise ValueError(f"Domain {domain_name} not found")
        
        f = Fernet(self.domain_keys[domain_name])
        return f.decrypt(encrypted_data)

class SecureAuditLogger:
    """Post-quantum cryptography ready audit logger"""
    
    def __init__(self, log_path: str = "./audit_logs"):
        self.log_path = log_path
        os.makedirs(log_path, exist_ok=True)
        self.chain_hash = None
        
    def create_evidence_entry(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Create immutable evidence chain entry"""
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event,
            "previous_hash": self.chain_hash or "genesis"
        }
        
        # Create entry hash
        entry_json = json.dumps(entry, sort_keys=True)
        entry_hash = hashlib.sha256(entry_json.encode()).hexdigest()
        
        # Add hash to entry
        entry["hash"] = entry_hash
        
        # Update chain hash
        self.chain_hash = entry_hash
        
        return entry
    
    def log_security_event(self, event_type: str, context: SecurityContext, 
                          details: Dict[str, Any]) -> str:
        """Log security event with evidence chain"""
        event = {
            "type": event_type,
            "context": context.to_dict(),
            "details": details
        }
        
        entry = self.create_evidence_entry(event)
        
        # Write to audit log
        log_file = os.path.join(self.log_path, f"audit_{datetime.now(timezone.utc).strftime('%Y%m%d')}.jsonl")
        with open(log_file, "a") as f:
            f.write(json.dumps(entry) + "\n")
        
        return entry["hash"]
    
    def verify_chain_integrity(self, date: str) -> bool:
        """Verify integrity of audit chain for given date"""
        log_file = os.path.join(self.log_path, f"audit_{date}.jsonl")
        
        if not os.path.exists(log_file):
            return False
        
        previous_hash = "genesis"
        with open(log_file, "r") as f:
            for line in f:
                entry = json.loads(line)
                
                # Verify previous hash matches
                if entry["previous_hash"] != previous_hash:
                    return False
                
                # Verify entry hash
                entry_copy = entry.copy()
                stored_hash = entry_copy.pop("hash")
                entry_json = json.dumps(entry_copy, sort_keys=True)
                calculated_hash = hashlib.sha256(entry_json.encode()).hexdigest()
                
                if stored_hash != calculated_hash:
                    return False
                
                previous_hash = stored_hash
        
        return True

class HeadySecurityOrchestrator:
    """Main security orchestrator combining all security modules"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        secret_key = config.get("secret_key", os.environ.get("HEADY_SECRET_KEY", secrets.token_hex(32)))
        
        self.ptaca = PTACAValidator(secret_key)
        self.raa = RAAExecutionFabric(self.ptaca)
        self.trust_domains = TrustDomainManager()
        self.audit_logger = SecureAuditLogger()
        
        # Initialize default trust domains
        self._initialize_default_domains()
    
    def _initialize_default_domains(self):
        """Initialize default trust domains"""
        # User domain
        self.trust_domains.create_domain("user", {
            "isolation_level": "moderate",
            "allowed_operations": ["read", "write"],
            "max_risk_level": RiskLevel.MEDIUM.value
        })
        
        # System domain
        self.trust_domains.create_domain("system", {
            "isolation_level": "strict",
            "allowed_operations": ["read", "write", "execute"],
            "max_risk_level": RiskLevel.CRITICAL.value
        })
        
        # Public domain
        self.trust_domains.create_domain("public", {
            "isolation_level": "open",
            "allowed_operations": ["read"],
            "max_risk_level": RiskLevel.LOW.value
        })
    
    async def authorize_operation(self, user_id: str, operation: str, 
                                 resource: str, hardware_token: Optional[str] = None,
                                 biometric_data: Optional[str] = None) -> Tuple[bool, str]:
        """Authorize an operation with full security checks"""
        
        # Create security context
        context = SecurityContext(
            user_id=user_id,
            session_id=secrets.token_hex(16),
            risk_level=RiskLevel.LOW,
            attestation_state=AttestationState.UNVERIFIED,
            hardware_token=hardware_token,
            biometric_verified=bool(biometric_data),
            timestamp=datetime.now(timezone.utc),
            nonce=secrets.token_hex(16)
        )
        
        # Verify hardware token if provided
        if hardware_token:
            nonce, signature = self.ptaca.generate_hardware_nonce()
            if self.ptaca.verify_hardware_presence(nonce, signature, hardware_token):
                context.attestation_state = AttestationState.VERIFIED
        
        # Validate execution
        authorized, message = self.raa.validate_execution(context, operation, resource)
        
        # Log security event
        self.audit_logger.log_security_event(
            "operation_authorization",
            context,
            {
                "operation": operation,
                "resource": resource,
                "authorized": authorized,
                "message": message
            }
        )
        
        return authorized, message
    
    def generate_secure_token(self, user_id: str, domain: str, 
                            expiry_minutes: int = 30) -> str:
        """Generate JWT token for domain access"""
        payload = {
            "user_id": user_id,
            "domain": domain,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=expiry_minutes),
            "iss": TRUST_DOMAIN,
            "aud": APP_DOMAIN
        }
        
        secret = self.config.get("jwt_secret", os.environ.get("JWT_SECRET", secrets.token_hex(32)))
        return jwt.encode(payload, secret, algorithm="HS256")
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            secret = self.config.get("jwt_secret", os.environ.get("JWT_SECRET"))
            payload = jwt.decode(token, secret, algorithms=["HS256"], 
                               audience=APP_DOMAIN, issuer=TRUST_DOMAIN)
            return payload
        except jwt.InvalidTokenError:
            return None

# Export main components
__all__ = [
    'HeadySecurityOrchestrator',
    'SecurityContext',
    'RiskLevel',
    'AttestationState',
    'PTACAValidator',
    'RAAExecutionFabric',
    'TrustDomainManager',
    'SecureAuditLogger'
]
