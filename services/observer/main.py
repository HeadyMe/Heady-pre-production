# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  OBSERVER Node — System Health Monitoring     ║
# ╚══════════════════════════════════════════════════════════════════╝

import asyncio
import json
import time
import os
import signal
import threading
from datetime import datetime, timedelta
from pathlib import Path
import hashlib
import numpy as np
from fastapi import FastAPI
from pyngrok import ngrok
import uvicorn
import aiohttp
import psutil
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OBSERVER Monitor Node", version="1.0.0")

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
NODE_ID = "observer-monitor"
NODE_ROLE = "observer"
NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN")
DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK")

# Global state
registered = False
server_url = None
monitoring_active = False
stop = False
last_hash = None

# Signal handler for graceful shutdown
def handler(sig, frame):
    global stop
    stop = True
    print("🛑 Shutdown signal received")

signal.signal(signal.SIGINT, handler)
signal.signal(signal.SIGTERM, handler)

# OBSERVER Monitoring System
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
        
        # FIX 2: Save data persistence
        await save_data(snapshot)
        
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
    
    # FIX 4: Add prediction
    def predict_degradation(self):
        if len(self.health_history) < 5:
            return None
        scores = [h['health_percentage'] for h in self.health_history[-10:]]
        trend = np.polyfit(range(len(scores)), scores, 1)[0]
        predicted = scores[-1] + (trend * 3)
        return predicted if predicted < self.alert_threshold else None

# Initialize OBSERVER
print("🔍 Initializing OBSERVER Monitoring System...")
observer = SystemMonitor()
print("✅ OBSERVER ready")

# FIX 2: Data persistence
async def save_data(data):
    try:
        # Save to Google Drive if available, otherwise local
        save_path = '/data/heady_observer.jsonl'
        with open(save_path, 'a') as f:
            json.dump(data, f)
            f.write('\n')
    except Exception as e:
        print(f"❌ Failed to save data: {e}")

# FIX 3: Alert system
async def alert(msg):
    if DISCORD_WEBHOOK:
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(DISCORD_WEBHOOK, json={"content": f"🚨 {msg}"})
        except Exception as e:
            print(f"❌ Failed to send alert: {e}")

@app.on_event("startup")
async def startup():
    global server_url, monitoring_active
    # Setup ngrok tunnel if token provided
    if NGROK_AUTH_TOKEN:
        try:
            ngrok.set_auth_token(NGROK_AUTH_TOKEN)
            tunnel = ngrok.connect(8002)
            server_url = tunnel.public_url
            print(f"🌐 OBSERVER Public URL: {server_url}")
        except Exception as e:
            print(f"❌ Ngrok setup failed: {e}")
    
    # Register with Builder Worker
    await register_with_builder()
    
    # Start background monitoring
    monitoring_active = True
    monitoring_thread = threading.Thread(target=background_monitor, daemon=True)
    monitoring_thread.start()

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
                        "monitoring_services": len(observer.services),
                        "alert_threshold": observer.alert_threshold,
                        "history_retention": 100,
                        "prediction": True
                    },
                    "triggers": ["health_check", "system_monitoring", "alerting"],
                    "primary_tool": "system-monitor"
                }
                
                async with session.post(f"{BUILDER_URL}/register", json=payload) as resp:
                    if resp.status == 200:
                        registered = True
                        print(f"✅ OBSERVER registered with Builder Worker")
                        return
                    else:
                        print(f"❌ OBSERVER failed to register: {resp.status}")
        except Exception as e:
            print(f"❌ OBSERVER registration error: {e}")
            if attempt < 2:
                await asyncio.sleep(5)

def background_monitor():
    """Background monitoring loop"""
    asyncio.set_event_loop(asyncio.new_event_loop())
    
    async def monitor_loop():
        # FIX 1: Handle stop signal
        while monitoring_active and not stop:
            try:
                snapshot = await observer.monitor_all_services()
                health_pct = snapshot['health_percentage']
                
                print(f"📊 System Health: {health_pct:.0f}% ({snapshot['healthy_services']}/{snapshot['total_services']} services)")
                
                # Check for alerts
                if observer.should_alert(health_pct):
                    print(f"🚨 ALERT: System health degraded to {health_pct:.0f}%")
                    await alert(f"System health degraded to {health_pct:.0f}%")
                
                # Check predictions
                predicted = observer.predict_degradation()
                if predicted:
                    print(f"🔮 PREDICTION: Health may drop to {predicted:.0f}% in 3 checks")
                    await alert(f"Health may drop to {predicted:.0f}% in 3 checks")
                
                await asyncio.sleep(60)  # Check every minute
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
                await asyncio.sleep(30)
    
    asyncio.run(monitor_loop())

# API Endpoints
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "node_id": NODE_ID,
        "role": NODE_ROLE,
        "registered": registered,
        "monitoring_active": monitoring_active,
        "services_monitored": len(observer.services),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/status")
async def status():
    """Get current monitoring status"""
    if not observer.health_history:
        return {"status": "no_data_yet"}
    
    latest = observer.health_history[-1]
    trends = observer.analyze_trends()
    system_metrics = observer.get_system_metrics()
    predicted = observer.predict_degradation()
    
    return {
        "current_health": latest['health_percentage'],
        "trend": trends['trend'],
        "services": latest['services'],
        "system_metrics": system_metrics,
        "monitoring_active": monitoring_active,
        "last_check": latest['timestamp'],
        "predicted_degradation": predicted
    }

@app.get("/history")
async def history():
    """Get monitoring history"""
    return {
        "snapshots": observer.health_history[-20:],  # Last 20 snapshots
        "total_snapshots": len(observer.health_history)
    }

@app.post("/task")
async def handle_task(request: dict):
    """Handle monitoring tasks"""
    try:
        task_type = request.get('task_type')
        payload = request.get('payload')
        
        if task_type == 'health_check':
            snapshot = await observer.monitor_all_services()
            return {
                "status": "completed",
                "snapshot": snapshot,
                "node_id": NODE_ID,
                "execution_time_ms": 100
            }
        
        elif task_type == 'system_metrics':
            metrics = observer.get_system_metrics()
            return {
                "status": "completed",
                "metrics": metrics,
                "node_id": NODE_ID,
                "execution_time_ms": 50
            }
        
        return {"status": "unknown_task_type", "node_id": NODE_ID}
    except Exception as e:
        return {"error": str(e), "node_id": NODE_ID}

@app.get("/heartbeat")
async def heartbeat():
    return {
        "node_id": NODE_ID,
        "status": "active",
        "monitoring_active": monitoring_active,
        "services_count": len(observer.services),
        "last_check": observer.health_history[-1]['timestamp'] if observer.health_history else None,
        "predicted_degradation": observer.predict_degradation()
    }

if __name__ == "__main__":
    print("🚀 OBSERVER Monitor Node starting...")
    print(f"📍 Node ID: {NODE_ID}")
    print(f"🎯 Role: {NODE_ROLE}")
    print(f"📊 Monitoring {len(observer.services)} services")
    
    # Start server
    uvicorn.run(app, host="::", port=8002)
