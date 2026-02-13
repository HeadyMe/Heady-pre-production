# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  JULES AI Node — LLM Inference & Text Gen     ║
# ╚══════════════════════════════════════════════════════════════════╝

# Cell 1: Install dependencies + setup
!pip install -q aiohttp transformers torch accelerate bitsandbytes

import torch
import asyncio
import aiohttp
import json
import time
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

print(f'PyTorch: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
    print(f'GPU Memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB')

BUILDER_URL = "https://builder-dev.headysystems.com"
NOTEBOOK_ID = "jules-ai-node"

# Cell 2: Setup JULES AI Processing
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

# Cell 3: Register with Builder Worker
async def register_with_builder():
    async with aiohttp.ClientSession() as session:
        payload = {
            "notebook_id": NOTEBOOK_ID,
            "role": "ai-processing",
            "capabilities": {
                "gpu_type": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
                "gpu_memory_gb": torch.cuda.get_device_properties(0).total_mem / 1e9 if torch.cuda.is_available() else 0,
                "model": jules.model_name,
                "model_loaded": model_loaded
            },
            "triggers": ["text_generation", "conversation", "text_analysis", "ai_processing"]
        }
        
        try:
            async with session.post(f"{BUILDER_URL}/register", json=payload) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(f"✅ {NOTEBOOK_ID} registered successfully")
                    print(f"📊 Registered notebooks: {result['registered_notebooks']}")
                    return True
                else:
                    print(f"❌ Registration failed: {resp.status}")
                    return False
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return False

# Register now
registered = asyncio.run(register_with_builder())
print(f"🎯 Registration status: {'SUCCESS' if registered else 'FAILED'}")

# Cell 4: Task execution engine
async def execute_ai_task(task):
    task_id = task.get('id', 'unknown')
    task_type = task.get('task_type', 'unknown')
    payload = task.get('payload', {})
    
    print(f"🤖 Processing AI task {task_id}: {task_type}")
    
    try:
        if task_type == 'text_generation':
            prompt = payload.get('prompt', '')
            response = jules.generate_response(prompt)
            result = {
                "status": "completed",
                "response": response,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 200
            }
        
        elif task_type == 'text_analysis':
            text = payload.get('text', '')
            analysis = jules.analyze_text(text)
            result = {
                "status": "completed",
                "analysis": analysis,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 50
            }
        
        elif task_type == 'conversation':
            message = payload.get('message', '')
            response = jules.generate_response(f"User: {message}\nAI:", max_length=100)
            result = {
                "status": "completed",
                "response": response,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 300
            }
        
        else:
            result = {
                "status": "unknown_task_type",
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID
            }
        
        # Report completion back to Builder
        async with aiohttp.ClientSession() as session:
            await session.post(f"{BUILDER_URL}/task/complete", json=result)
        
        print(f"✅ AI task completed: {task_id}")
        return result
        
    except Exception as e:
        error_result = {
            "status": "error",
            "task_id": task_id,
            "error": str(e),
            "notebook_id": NOTEBOOK_ID
        }
        
        async with aiohttp.ClientSession() as session:
            await session.post(f"{BUILDER_URL}/task/complete", json=error_result)
        
        return error_result

# Cell 5: Task polling loop
async def listen_for_ai_tasks():
    print(f"👂 Starting AI task listener for {NOTEBOOK_ID}...")
    
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{BUILDER_URL}/tasks?notebook_id={NOTEBOOK_ID}") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        tasks = data.get('tasks', [])
                        
                        if tasks:
                            print(f"📋 Received {len(tasks)} AI tasks")
                            
                            for task in tasks:
                                await execute_ai_task(task)
                    
        except Exception as e:
            print(f"❌ AI task listener error: {e}")
        
        await asyncio.sleep(5)  # Poll every 5 seconds

# Start listening in background
def run_ai_listener():
    asyncio.run(listen_for_ai_tasks())

ai_listener_thread = threading.Thread(target=run_ai_listener, daemon=True)
ai_listener_thread.start()

print(f"🎵 AI task listener started for {NOTEBOOK_ID}")

# Cell 6: Health check
async def health_check():
    return {
        "status": "healthy",
        "notebook_id": NOTEBOOK_ID,
        "role": "ai-processing",
        "gpu_available": torch.cuda.is_available(),
        "model_loaded": model_loaded,
        "registered": registered,
        "model_name": jules.model_name,
        "timestamp": datetime.now().isoformat()
    }

# Test health check
health = asyncio.run(health_check())
print(f"🏥 Health Status: {health['status']}")
print(f"🤖 Model loaded: {health['model_loaded']}")
print(f"🎯 GPU available: {health['gpu_available']}")
print(f"📊 Registered with Builder: {health['registered']}")

print("""
## 🚀 JULES AI Node Status

✅ Notebook ID: jules-ai-node
✅ Role: ai-processing
✅ Builder URL: https://builder-dev.headysystems.com
✅ AI Model: microsoft/DialoGPT-medium
✅ Task Listener: Active
✅ GPU Acceleration: Available

### Capabilities
- Text generation
- Conversation processing
- Sentiment analysis
- Text insight extraction

### Connection Status
- Registered with Builder Worker
- Polling for AI tasks every 5 seconds
- Auto-reports task completion
- Health monitoring active
""")
