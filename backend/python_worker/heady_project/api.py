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
# ║  FILE: backend/python_worker/heady_project/api.py                 ║
# ║  LAYER: backend                                                   ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

import os
import logging
import secrets
import asyncio
import json
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
app = FastAPI(title="Heady Admin Console")

# Security
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "default_insecure_token")
SETTINGS_FILE = "admin_settings.json"

async def verify_token(x_admin_token: str = Header(None)):
    token = x_admin_token
    if not token:
        raise HTTPException(status_code=401, detail="Missing Admin Token")
    if not secrets.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid Admin Token")
    return token

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        # Iterate over a copy to allow removal during iteration if needed (though disconnect handles it)
        for connection in self.active_connections[:]:
            try:
                await connection.send_text(message)
            except Exception:
                # If sending fails, we assume it's dead, but let disconnect handle cleanup
                pass

manager = ConnectionManager()

# Logging Handler
class BroadcastHandler(logging.Handler):
    def emit(self, record):
        entry = self.format(record)
        # Fire and forget async broadcast
        try:
            loop = asyncio.get_running_loop()
            if loop.is_running():
                loop.create_task(manager.broadcast(entry))
        except RuntimeError:
            pass

broadcast_handler = BroadcastHandler()
broadcast_handler.setFormatter(logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s"))
logging.getLogger().addHandler(broadcast_handler)


# Models
class FileContent(BaseModel):
    path: str
    content: str

class ActionRequest(BaseModel):
    action: str
    params: Optional[dict] = {}

class AIAssistRequest(BaseModel):
    context: str
    prompt: str

class SummarizeRequest(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    context: Optional[str] = ""

class MCPToolRequest(BaseModel):
    server: str
    tool: str
    arguments: Dict[str, Any] = {}

class RemoteGPUConfig(BaseModel):
    enabled: bool = False
    host: str = "localhost"
    port: int = 8000
    memory_limit: str = "16GB"
    use_rdma: bool = False

class Settings(BaseModel):
    remote_gpu: RemoteGPUConfig = RemoteGPUConfig()

# API Endpoints
def validate_path(path: str):
    root_dir = os.path.abspath(".")
    requested_path = os.path.abspath(path)
    if not os.path.commonpath([root_dir, requested_path]) == root_dir:
        raise HTTPException(status_code=403, detail="Access denied: Path outside project root")
    return requested_path

def load_settings_data() -> Settings:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r") as f:
                return Settings.model_validate_json(f.read())
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            return Settings()
    return Settings()

@app.get("/api/files", dependencies=[Depends(verify_token)])
async def list_files(path: str = "."):
    try:
        validated_path = validate_path(path)
    except HTTPException:
        validated_path = os.path.abspath(".")

    file_list = []
    for root, dirs, files in os.walk(validated_path):
        if ".git" in root or "__pycache__" in root or "node_modules" in root:
            continue
        for name in files:
            rel_path = os.path.relpath(os.path.join(root, name), ".")
            file_list.append(rel_path)
    return {"files": file_list}

@app.get("/api/files/{file_path:path}", dependencies=[Depends(verify_token)])
async def read_file(file_path: str):
    validated_path = validate_path(file_path)
    if not os.path.exists(validated_path):
        raise HTTPException(status_code=404, detail="File not found")
    try:
        with open(validated_path, "r") as f:
            return {"content": f.read()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/files", dependencies=[Depends(verify_token)])
async def save_file(file_data: FileContent):
    validated_path = validate_path(file_data.path)
    try:
        with open(validated_path, "w") as f:
            f.write(file_data.content)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

@app.post("/api/ai_assist", dependencies=[Depends(verify_token)])
async def ai_assist(request: AIAssistRequest):
    logger.info(f"AI Assistant Request: {request.prompt}")
    full_prompt = f"Context: {request.context[:500]}\nUser: {request.prompt}\nAssistant:"
    response = nlp_service.generate_response(full_prompt)
    suggestion = response.replace(full_prompt, "").strip()
    return {"suggestion": suggestion or response}

@app.post("/api/ai/chat", dependencies=[Depends(verify_token)])
async def chat_with_ai(request: ChatRequest):
    conversation = "\n".join([f"{msg.role}: {msg.content}" for msg in request.messages])
    full_prompt = f"Context: {request.context[:1000]}\n{conversation}\nAssistant:"
    response = nlp_service.generate_response(full_prompt)
    response_text = response.replace(full_prompt, "").strip()
    return {"reply": response_text or response}

@app.post("/api/summarize", dependencies=[Depends(verify_token)])
async def summarize_text(request: SummarizeRequest):
    logger.info("Summarization Request received")
    summary = nlp_service.summarize_text(request.text)
    return {"summary": summary}

@app.get("/api/mcp/servers", dependencies=[Depends(verify_token)])
async def list_mcp_servers():
    return {"servers": mcp_service.list_servers()}

@app.post("/api/mcp/tool", dependencies=[Depends(verify_token)])
async def execute_mcp_tool(request: MCPToolRequest):
    result = await mcp_service.execute_tool(request.server, request.tool, request.arguments)
    return result

@app.get("/api/settings", dependencies=[Depends(verify_token)])
async def get_settings():
    return load_settings_data()

@app.post("/api/settings", dependencies=[Depends(verify_token)])
async def update_settings(settings: Settings):
    try:
        with open(SETTINGS_FILE, "w") as f:
            f.write(settings.model_dump_json(indent=2))
        return {"status": "saved"}
    except Exception as e:
        logger.error(f"Failed to save settings: {e}")
        raise HTTPException(status_code=500, detail="Failed to save settings")

@app.websocket("/api/logs")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    if not token or not secrets.compare_digest(token, ADMIN_TOKEN):
        await websocket.close(code=1008)
        return

    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Websocket error: {e}")
        manager.disconnect(websocket)

# Serve Frontend
if os.path.exists("frontend/build"):
    app.mount("/", StaticFiles(directory="frontend/build", html=True), name="static")
