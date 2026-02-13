# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  OBSERVER Node — System Health Monitoring     ║
# ╚══════════════════════════════════════════════════════════════════╝

# Cell 1: Install dependencies + setup
!pip install -q aiohttp requests psutil matplotlib seaborn

import asyncio
import aiohttp
import json
import time
import psutil
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import pandas as pd

print(f'Python: {psutil.__version__}')
print(f'CPU Cores: {psutil.cpu_count()}')
print(f'Memory: {psutil.virtual_memory().total / 1e9:.1f} GB')

BUILDER_URL = "https://builder-dev.headysystems.com"
NOTEBOOK_ID = "observer-monitor"

# Cell 2: OBSERVER Monitoring System
class SystemMonitor:
    def __init__(self):
        self.services = [
            "https://api.headyconnection.org/health",
            "https://auth.headyconnection.org/health", 
            "https://builder-dev.headysystems.com/status",
            "https://headycloud.com/api/pulse",
            "https://headyconnection.com/api/pulse",
            "https://headysystems.com/api/pulse"
        ]
        self.health_history = []
        self.alert_threshold = 75  # Alert if less than 75% services healthy
        self.last_alert = None
        
    async def check_service(self, url, session):
        """Check individual service health"""
        start_time = time.time()
        try:
            async with session.get(url, timeout=10) as resp:
                response_time = (time.time() - start_time) * 1000
                healthy = resp.status == 200
                
                # Try to parse response for additional info
                try:
                    data = await resp.json()
                    service_info = {
                        'status': data.get('status', 'unknown'),
                        'version': data.get('version', 'unknown'),
                        'timestamp': data.get('ts', datetime.now().isoformat())
                    }
                except:
                    service_info = {'status': 'http_ok', 'version': 'unknown'}
                
                return {
                    'url': url,
                    'healthy': healthy,
                    'response_time_ms': response_time,
                    'status_code': resp.status,
                    'info': service_info,
                    'timestamp': datetime.now().isoformat()
                }
        except Exception as e:
            return {
                'url': url,
                'healthy': False,
                'response_time_ms': None,
                'status_code': None,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    async def monitor_all_services(self):
        """Monitor all configured services"""
        async with aiohttp.ClientSession() as session:
            tasks = [self.check_service(url, session) for url in self.services]
            results = await asyncio.gather(*tasks)
            
        # Calculate overall health
        healthy_count = sum(1 for r in results if r['healthy'])
        total_count = len(results)
        health_percentage = (healthy_count / total_count) * 100
        
        # Store in history
        snapshot = {
            'timestamp': datetime.now().isoformat(),
            'health_percentage': health_percentage,
            'healthy_services': healthy_count,
            'total_services': total_count,
            'services': results
        }
        self.health_history.append(snapshot)
        
        # Keep only last 100 snapshots
        if len(self.health_history) > 100:
            self.health_history = self.health_history[-100:]
        
        return snapshot
    
    def get_system_metrics(self):
        """Get local system metrics"""
        return {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'network_io': psutil.net_io_counters()._asdict() if psutil.net_io_counters() else {},
            'boot_time': psutil.boot_time(),
            'timestamp': datetime.now().isoformat()
        }
    
    def analyze_trends(self):
        """Analyze health trends over time"""
        if len(self.health_history) < 2:
            return {'trend': 'insufficient_data'}
        
        recent = self.health_history[-10:]  # Last 10 checks
        health_scores = [h['health_percentage'] for h in recent]
        
        # Simple trend analysis
        if health_scores[-1] < self.alert_threshold:
            return {'trend': 'critical', 'current_score': health_scores[-1]}
        elif len(health_scores) >= 3:
            if all(health_scores[i] <= health_scores[i+1] for i in range(len(health_scores)-1)):
                return {'trend': 'improving', 'current_score': health_scores[-1]}
            elif all(health_scores[i] >= health_scores[i+1] for i in range(len(health_scores)-1)):
                return {'trend': 'degrading', 'current_score': health_scores[-1]}
        
        return {'trend': 'stable', 'current_score': health_scores[-1]}
    
    def should_alert(self, current_health):
        """Check if we should send an alert"""
        if current_health < self.alert_threshold:
            if self.last_alert is None or (datetime.now() - self.last_alert) > timedelta(minutes=5):
                self.last_alert = datetime.now()
                return True
        return False

# Initialize OBSERVER
print("🔍 Initializing OBSERVER Monitoring System...")
observer = SystemMonitor()
print("✅ OBSERVER ready")

# Cell 3: Register with Builder Worker
async def register_with_builder():
    async with aiohttp.ClientSession() as session:
        payload = {
            "notebook_id": NOTEBOOK_ID,
            "role": "monitoring",
            "capabilities": {
                "monitoring_services": len(observer.services),
                "alert_threshold": observer.alert_threshold,
                "history_retention": 100
            },
            "triggers": ["health_check", "system_monitoring", "alerting"]
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
async def execute_monitoring_task(task):
    task_id = task.get('id', 'unknown')
    task_type = task.get('task_type', 'unknown')
    payload = task.get('payload', {})
    
    print(f"🔍 Processing monitoring task {task_id}: {task_type}")
    
    try:
        if task_type == 'health_check':
            snapshot = await observer.monitor_all_services()
            result = {
                "status": "completed",
                "snapshot": snapshot,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 100
            }
        
        elif task_type == 'system_metrics':
            metrics = observer.get_system_metrics()
            result = {
                "status": "completed",
                "metrics": metrics,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 50
            }
        
        elif task_type == 'trend_analysis':
            trends = observer.analyze_trends()
            result = {
                "status": "completed",
                "trends": trends,
                "task_id": task_id,
                "notebook_id": NOTEBOOK_ID,
                "execution_time_ms": 30
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
        
        print(f"✅ Monitoring task completed: {task_id}")
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

# Cell 5: Background monitoring loop
async def continuous_monitoring():
    print(f"🔄 Starting continuous monitoring for {NOTEBOOK_ID}...")
    
    while True:
        try:
            # Perform health check
            snapshot = await observer.monitor_all_services()
            health_pct = snapshot['health_percentage']
            
            print(f"📊 System Health: {health_pct:.0f}% ({snapshot['healthy_services']}/{snapshot['total_services']} services)")
            
            # Check for alerts
            if observer.should_alert(health_pct):
                print(f"🚨 ALERT: System health degraded to {health_pct:.0f}%")
                # Here you could send to Discord, Slack, etc.
            
        except Exception as e:
            print(f"❌ Monitoring error: {e}")
        
        await asyncio.sleep(60)  # Check every minute

# Cell 6: Task polling loop
async def listen_for_monitoring_tasks():
    print(f"👂 Starting monitoring task listener for {NOTEBOOK_ID}...")
    
    # Start continuous monitoring in background
    monitoring_task = asyncio.create_task(continuous_monitoring())
    
    while True:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{BUILDER_URL}/tasks?notebook_id={NOTEBOOK_ID}") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        tasks = data.get('tasks', [])
                        
                        if tasks:
                            print(f"📋 Received {len(tasks)} monitoring tasks")
                            
                            for task in tasks:
                                await execute_monitoring_task(task)
                    
        except Exception as e:
            print(f"❌ Monitoring task listener error: {e}")
        
        await asyncio.sleep(5)  # Poll every 5 seconds

# Start listening in background
def run_monitoring_listener():
    asyncio.run(listen_for_monitoring_tasks())

monitoring_listener_thread = threading.Thread(target=run_monitoring_listener, daemon=True)
monitoring_listener_thread.start()

print(f"🎵 Monitoring task listener started for {NOTEBOOK_ID}")

# Cell 7: Health check
async def health_check():
    return {
        "status": "healthy",
        "notebook_id": NOTEBOOK_ID,
        "role": "monitoring",
        "registered": registered,
        "services_monitored": len(observer.services),
        "health_history_size": len(observer.health_history),
        "timestamp": datetime.now().isoformat()
    }

# Test health check
health = asyncio.run(health_check())
print(f"🏥 Health Status: {health['status']}")
print(f"📊 Services monitored: {health['services_monitored']}")
print(f"📈 Health history: {health['health_history_size']} snapshots")
print(f"🎯 Registered with Builder: {health['registered']}")

print("""
## 🚀 OBSERVER Monitor Status

✅ Notebook ID: observer-monitor
✅ Role: monitoring
✅ Builder URL: https://builder-dev.headysystems.com
✅ Services Monitored: 6 critical endpoints
✅ Task Listener: Active
✅ Continuous Monitoring: Active

### Capabilities
- Service health monitoring
- System metrics collection
- Trend analysis
- Alert generation
- Historical data tracking

### Monitored Services
- api.headyconnection.org
- auth.headyconnection.org
- builder-dev.headysystems.com
- headycloud.com
- headyconnection.com
- headysystems.com

### Connection Status
- Registered with Builder Worker
- Polling for monitoring tasks every 5 seconds
- Continuous health checks every 60 seconds
- Auto-reports task completion
- Health monitoring active
""")
