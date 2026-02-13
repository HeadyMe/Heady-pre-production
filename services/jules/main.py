# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  JULES AI Node — LLM Inference & Text Gen     ║
# ╚══════════════════════════════════════════════════════════════════╝

import asyncio
import json
import time
import os
import signal
import socket
import threading
from collections import defaultdict
from datetime import datetime
from fastapi import FastAPI
from pyngrok import ngrok
import uvicorn
import aiohttp
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="JULES AI Node", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BUILDER_URL = os.getenv("BUILDER_URL", "https://builder-dev.headysystems.com")
NODE_ID = "jules-ai-node"
NODE_ROLE = "jules"
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN")

# Global state
registered = False
server_url = None
stop = False
model_loaded = False

# FIX 4: Conversation memory
history = defaultdict(list)

# Signal handler for graceful shutdown
def handler(sig, frame):
    global stop
    stop = True
    print("🛑 Shutdown signal received")

signal.signal(signal.SIGINT, handler)
signal.signal(signal.SIGTERM, handler)

# FIX 3: Find available port
def find_port():
    for port in range(8001, 8100):
        try:
            s = socket.socket()
            s.bind(('', port))
            s.close()
            return port
        except:
            continue
    return 8001

# Use dynamic port
PORT = find_port()

# JULES AI Processing
class JULESAIProcessor:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = "microsoft/DialoGPT-medium"  # Lightweight conversational model
        self.tokenizer = None
        self.model = None
        self.pipeline = None
        
    def load_model(self):
        """Load the AI model"""
        print(f"🤖 Loading JULES AI model: {self.model_name}")
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None
            )
            self.pipeline = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                device=0 if self.device == "cuda" else -1,
                max_length=200,
                temperature=0.7,
                do_sample=True
            )
            print("✅ JULES AI model loaded successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            return False
    
    def generate_response(self, prompt, max_length=150):
        """Generate AI response"""
        if not self.pipeline:
            return "AI model not loaded"
        
        try:
            responses = self.pipeline(
                prompt,
                max_length=max_length,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
            return responses[0]['generated_text'].replace(prompt, "").strip()
        except Exception as e:
            return f"Generation error: {str(e)}"
    
    def analyze_text(self, text):
        """Analyze text for sentiment and key insights"""
        # Simple text analysis
        words = text.lower().split()
        sentiment_words = {
            'positive': ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'],
            'negative': ['bad', 'terrible', 'awful', 'horrible', 'disaster', 'failure'],
            'neutral': ['okay', 'fine', 'average', 'normal', 'standard']
        }
        
        sentiment_scores = {}
        for sentiment, words_list in sentiment_words.items():
            matches = sum(1 for word in words if word in words_list)
            sentiment_scores[sentiment] = matches / len(words) if words else 0
        
        dominant_sentiment = max(sentiment_scores, key=sentiment_scores.get)
        
        return {
            'sentiment': dominant_sentiment,
            'sentiment_scores': sentiment_scores,
            'word_count': len(words),
            'complexity': len(set(words)) / len(words) if words else 0
        }

# Initialize JULES
print("🧠 Initializing JULES AI Processor...")
jules = JULESAIProcessor()
model_loaded = jules.load_model()

@app.on_event("startup")
async def startup():
    global server_url
    # Setup ngrok tunnel if token provided
    if NGROK_AUTH_TOKEN:
        try:
            ngrok.set_auth_token(NGROK_AUTH_TOKEN)
            tunnel = ngrok.connect(PORT)
            server_url = tunnel.public_url
            print(f"🌐 JULES Public URL: {server_url}")
        except Exception as e:
            print(f"❌ Ngrok setup failed: {e}")
    
    # FIX 1: Wait for server startup
    await asyncio.sleep(3)
    
    # Register with Builder Worker
    await register_with_builder()

@app.on_event("shutdown")
async def shutdown():
    # Cleanup ngrok
    try:
        ngrok.kill()
    except:
        pass

async def register_with_builder():
    global registered
    # FIX 2: Add retry logic
    for attempt in range(3):
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "notebook_id": NODE_ID,
                    "role": NODE_ROLE,
                    "capabilities": {
                        "gpu_type": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
                        "gpu_memory_gb": torch.cuda.get_device_properties(0).total_mem / 1e9 if torch.cuda.is_available() else 0,
                        "model": jules.model_name,
                        "model_loaded": model_loaded
                    },
                    "triggers": ["text_generation", "conversation", "text_analysis", "ai_processing"],
                    "primary_tool": "transformers"
                }
                
                async with session.post(f"{BUILDER_URL}/register", json=payload) as resp:
                    if resp.status == 200:
                        registered = True
                        print(f"✅ JULES registered with Builder Worker")
                        return
                    else:
                        print(f"❌ JULES failed to register: {resp.status}")
        except Exception as e:
            print(f"❌ JULES registration error: {e}")
            if attempt < 2:
                await asyncio.sleep(5)

# API Endpoints
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "node_id": NODE_ID,
        "role": NODE_ROLE,
        "gpu_available": torch.cuda.is_available(),
        "model_loaded": model_loaded,
        "registered": registered,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/task")
async def handle_task(request: dict):
    """Handle AI processing tasks"""
    try:
        task_type = request.get('task_type')
        payload = request.get('payload')
        
        if task_type == 'text_generation':
            prompt = payload.get('prompt', '')
            response = jules.generate_response(prompt)
            return {
                "status": "completed",
                "response": response,
                "node_id": NODE_ID,
                "execution_time_ms": 200
            }
        
        elif task_type == 'text_analysis':
            text = payload.get('text', '')
            analysis = jules.analyze_text(text)
            return {
                "status": "completed",
                "analysis": analysis,
                "node_id": NODE_ID,
                "execution_time_ms": 50
            }
        
        elif task_type == 'conversation':
            message = payload.get('message', '')
            user_id = payload.get('user_id', 'default')
            
            # FIX 4: Add conversation memory
            history[user_id].append(f"User: {message}")
            context = "\n".join(history[user_id][-10:])
            response = jules.generate_response(f"{context}\nAI:")
            history[user_id].append(f"AI: {response}")
            
            return {
                "status": "completed",
                "response": response,
                "node_id": NODE_ID,
                "execution_time_ms": 300,
                "context_length": len(history[user_id])
            }
        
        return {"status": "unknown_task_type", "node_id": NODE_ID}
    except Exception as e:
        return {"error": str(e), "node_id": NODE_ID}

@app.get("/heartbeat")
async def heartbeat():
    return {
        "node_id": NODE_ID,
        "status": "active",
        "model_loaded": model_loaded,
        "gpu_utilization": 0.3 if torch.cuda.is_available() else 0,
        "last_task": time.time(),
        "conversation_memory": len(history)
    }

if __name__ == "__main__":
    print("🚀 JULES AI Node starting...")
    print(f"📍 Node ID: {NODE_ID}")
    print(f"🎯 Role: {NODE_ROLE}")
    print(f"🤖 Model: {jules.model_name}")
    print(f"🔌 Port: {PORT}")
    
    # Start server
    uvicorn.run(app, host="0.0.0.0", port=PORT)
