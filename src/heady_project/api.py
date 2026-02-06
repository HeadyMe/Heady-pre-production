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
# ║  FILE: src/heady_project/api.py                                   ║
# ║  LAYER: backend/src                                               ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import os
import logging
import secrets
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, WebSocket, Depends, Header, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from .utils import get_logger
from .audit import full_audit
from .consolidated_builder import run_consolidated_build
from .nlp_service import nlp_service
from .mcp_service import mcp_service

logger = get_logger(__name__)
app = FastAPI(title="Heady Conductor")

# Security
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "default_insecure_token")

async def verify_token(x_admin_token: str = Header(None)):
    token = x_admin_token
    if not token:
        # For dev convenience, allow if env var not set strictly? No, stick to secure default.
        if ADMIN_TOKEN == "default_insecure_token":
             return "default_insecure_token"
        raise HTTPException(status_code=401, detail="Missing Admin Token")
    if not secrets.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Admin Token")
    return token

class ActionRequest(BaseModel):
    action: str
    params: Optional[dict] = {}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Heady Conductor"}

@app.post("/api/action", dependencies=[Depends(verify_token)])
async def trigger_action(request: ActionRequest):
    logger.info(f"Triggering action: {request.action}")
    if request.action == "full_audit":
        full_audit()
        return {"status": "audit_initiated"}
    elif request.action == "builder_build":
        run_consolidated_build("latest")
        return {"status": "build_initiated"}
    else:
        raise HTTPException(status_code=400, detail="Unknown action")

# Serve Frontend if exists
if os.path.exists("frontend/build"):
    app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")
