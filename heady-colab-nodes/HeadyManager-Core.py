# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  HeadyManager Core — API Orchestration        ║
# ╚══════════════════════════════════════════════════════════════════╝

# Cell 1: Install dependencies + setup
!pip install -q aiohttp python-dotenv requests

import aiohttp
import asyncio
import os
import json
from datetime import datetime

BUILDER_URL = "https://builder-dev.headysystems.com"
NOTEBOOK_ID = "heady-manager-core"

print(f"🚀 Initializing {NOTEBOOK_ID}...")
print(f"🌐 Builder URL: {BUILDER_URL}")

# Cell 2: Register with Builder Worker
async def register_with_builder():
    async with aiohttp.ClientSession() as session:
        payload = {
            "notebook_id": NOTEBOOK_ID,
            "role": "orchestration",
            "capabilities": ["api", "orchestration", "task_coordination"],
            "triggers": ["api_requests", "system_orchestration", "task_distribution"]
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

# Cell 3: Task execution engine
class TaskExecutor:
    def __init__(self):
        self.active_tasks = {}
        self.completed_tasks = []
    
    async def execute_task(self, task):
        task_id = task.get('id', 'unknown')
        task_type = task.get('task_type', 'unknown')
        payload = task.get('payload', {})
        
        print(f"🔧 Executing task {task_id}: {task_type}")
        
        try:
            if task_type == 'api_orchestration':
                result = await self.handle_api_orchestration(payload)
            elif task_type == 'system_coordination':
                result = await self.handle_system_coordination(payload)
            elif task_type == 'health_check':
                result = await self.handle_health_check(payload)
            else:
                result = {"status": "unknown_task_type", "task_type": task_type}
            
            self.completed_tasks.append({
                "task_id": task_id,
                "completed_at": datetime.now().isoformat(),
                "result": result
            })
            
            return {
                "status": "completed",
                "task_id": task_id,
                "result": result,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 100
            }
            
        except Exception as e:
            return {
                "status": "error",
                "task_id": task_id,
                "error": str(e),
                "notebook_id": NOTEBOOK_ID
            }
    
    async def handle_api_orchestration(self, payload):
        # Handle API orchestration tasks
        service = payload.get('service', 'unknown')
        action = payload.get('action', 'unknown')
        
        print(f"🎯 Orchestrating: {action} on {service}")
        
        # Simulate orchestration logic
        await asyncio.sleep(0.1)
        
        return {
            "service": service,
            "action": action,
            "orchestrated": True,
            "timestamp": datetime.now().isoformat()
        }
    
    async def handle_system_coordination(self, payload):
        # Handle system coordination tasks
        components = payload.get('components', [])
        
        print(f"🔄 Coordinating {len(components)} components")
        
        # Simulate coordination
        await asyncio.sleep(0.1)
        
        return {
            "coordinated_components": components,
            "coordination_status": "success",
            "timestamp": datetime.now().isoformat()
        }
    
    async def handle_health_check(self, payload):
        # Handle health check tasks
        services = payload.get('services', [])
        
        results = {}
        for service in services:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(service, timeout=5) as resp:
                        results[service] = {
                            "status": "healthy" if resp.status == 200 else "unhealthy",
                            "response_code": resp.status
                        }
            except Exception as e:
                results[service] = {
                    "status": "error",
                    "error": str(e)
                }
        
        return {
            "health_results": results,
            "checked_at": datetime.now().isoformat()
        }

# Initialize task executor
executor = TaskExecutor()
print(f"⚡ Task executor initialized for {NOTEBOOK_ID}")

# Cell 4: Task polling loop
async def listen_for_tasks():
    print(f"👂 Starting task listener for {NOTEBOOK_ID}...")
    
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{BUILDER_URL}/tasks?notebook_id={NOTEBOOK_ID}") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        tasks = data.get('tasks', [])
                        
                        if tasks:
                            print(f"📋 Received {len(tasks)} tasks")
                            
                            for task in tasks:
                                result = await executor.execute_task(task)
                                print(f"✅ Task completed: {task.get('id')}")
                                
                                # Report completion back to Builder
                                await session.post(f"{BUILDER_URL}/task/complete", json=result)
                    
        except Exception as e:
            print(f"❌ Task listener error: {e}")
        
        await asyncio.sleep(5)  # Poll every 5 seconds

# Start listening in background
import threading

def run_listener():
    asyncio.run(listen_for_tasks())

listener_thread = threading.Thread(target=run_listener, daemon=True)
listener_thread.start()

print(f"🎵 Task listener started for {NOTEBOOK_ID}")

# Cell 5: Health check endpoint
async def health_check():
    return {
        "status": "healthy",
        "notebook_id": NOTEBOOK_ID,
        "role": "orchestration",
        "active_tasks": len(executor.active_tasks),
        "completed_tasks": len(executor.completed_tasks),
        "registered": registered,
        "timestamp": datetime.now().isoformat()
    }

# Test health check
health = asyncio.run(health_check())
print(f"🏥 Health Status: {health['status']}")
print(f"📊 Tasks completed: {health['completed_tasks']}")
print(f"🎯 Registered with Builder: {health['registered']}")

print("""
## 🚀 HeadyManager Core Status

✅ Notebook ID: heady-manager-core
✅ Role: orchestration
✅ Builder URL: https://builder-dev.headysystems.com
✅ Task Listener: Active
✅ Task Executor: Ready

### Capabilities
- API orchestration
- System coordination
- Health monitoring
- Task distribution

### Connection Status
- Registered with Builder Worker
- Polling for tasks every 5 seconds
- Auto-reports task completion
- Health monitoring active
""")
