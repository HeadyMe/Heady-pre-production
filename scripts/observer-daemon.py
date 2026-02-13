#!/usr/bin/env python3
# ╔══════════════════════════════════════════════════════════════════╗
# ║  ∞ SACRED GEOMETRY ∞  Observer Daemon — Continuous Monitoring      ║
# ╚══════════════════════════════════════════════════════════════════╝

import asyncio
import aiohttp
import logging
import json
import time
import smtplib
from datetime import datetime, timedelta
from email.message import EmailMessage
import os
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/heady-observer.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class HeadyObserver:
    def __init__(self):
        self.services = [
            "https://api.headyconnection.org/health",
            "https://auth.headyconnection.org/health", 
            "https://builder-dev.headysystems.com/status",
            "https://headysystems.com/api/health",
            "https://headycloud.com/api/health",
            "https://headyconnection.com/api/health"
        ]
        
        # Alert configuration
        self.webhook_url = os.getenv('DISCORD_WEBHOOK_URL')
        self.email_config = {
            'smtp_server': os.getenv('SMTP_SERVER'),
            'smtp_port': int(os.getenv('SMTP_PORT', 587)),
            'username': os.getenv('SMTP_USERNAME'),
            'password': os.getenv('SMTP_PASSWORD'),
            'to_email': os.getenv('ALERT_EMAIL')
        }
        
        self.alert_threshold = 75  # Alert if less than 75% services healthy
        self.last_alert = None
        self.health_history = []
        self.error_patterns = {}
        
    async def check_service(self, url):
        """Check individual service health"""
        start_time = time.time()
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                async with session.get(url) as resp:
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
                    
                    result = {
                        'url': url,
                        'healthy': healthy,
                        'response_time_ms': response_time,
                        'status_code': resp.status,
                        'info': service_info,
                        'timestamp': datetime.now().isoformat()
                    }
                    
                    if healthy:
                        logging.info(f"✅ {url}: {resp.status} ({response_time:.0f}ms)")
                    else:
                        logging.warning(f"⚠️ {url}: {resp.status} ({response_time:.0f}ms)")
                    
                    return result
                    
        except Exception as e:
            error_msg = f"❌ {url}: {str(e)}"
            logging.error(error_msg)
            await self.alert(f"🚨 Service DOWN: {url}\nError: {str(e)}")
            
            # Track error patterns
            self.track_error_pattern(url, str(e))
            
            return {
                'url': url,
                'healthy': False,
                'response_time_ms': None,
                'status_code': None,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def track_error_pattern(self, url, error):
        """Track error patterns for learning"""
        key = f"{url}:{error}"
        if key not in self.error_patterns:
            self.error_patterns[key] = {
                'count': 0,
                'first_seen': datetime.now(),
                'last_seen': datetime.now()
            }
        
        self.error_patterns[key]['count'] += 1
        self.error_patterns[key]['last_seen'] = datetime.now()
        
        # Alert on repeating errors
        if self.error_patterns[key]['count'] >= 5:
            self.alert_critical_error(key, self.error_patterns[key])
    
    async def monitor_all_services(self):
        """Monitor all configured services"""
        logging.info(f"🔍 Starting health check for {len(self.services)} services...")
        
        tasks = [self.check_service(url) for url in self.services]
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
        
        logging.info(f"📊 System health: {health_percentage:.0f}% ({healthy_count}/{total_count} services)")
        
        # Check for alerts
        if health_percentage < self.alert_threshold:
            await self.alert(f"⚠️ System health degraded: {health_percentage:.0f}%")
        
        return snapshot
    
    async def alert(self, message):
        """Send alert through multiple channels"""
        timestamp = datetime.now().isoformat()
        full_message = f"[{timestamp}] {message}"
        
        # Discord webhook
        if self.webhook_url:
            try:
                async with aiohttp.ClientSession() as session:
                    await session.post(self.webhook_url, json={"content": full_message})
                    logging.info("📢 Alert sent to Discord")
            except Exception as e:
                logging.error(f"Failed to send Discord alert: {e}")
        
        # Email alert
        if all(self.email_config.values()):
            try:
                await self.send_email_alert(full_message)
                logging.info("📧 Alert sent via email")
            except Exception as e:
                logging.error(f"Failed to send email alert: {e}")
        
        # Log alert
        logging.warning(f"🚨 ALERT: {message}")
    
    async def send_email_alert(self, message):
        """Send email alert"""
        msg = EmailMessage()
        msg['Subject'] = f'Heady Systems Alert - {datetime.now().strftime("%Y-%m-%d %H:%M")}'
        msg['From'] = self.email_config['username']
        msg['To'] = self.email_config['to_email']
        msg.set_content(message)
        
        server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
        server.starttls()
        server.login(self.email_config['username'], self.email_config['password'])
        server.send_message(msg)
        server.quit()
    
    def alert_critical_error(self, error_key, pattern):
        """Alert on critical error patterns"""
        message = f"🚨 CRITICAL: Error repeating {pattern['count']} times\n{error_key}\nFirst seen: {pattern['first_seen']}\nLast seen: {pattern['last_seen']}"
        asyncio.create_task(self.alert(message))
    
    async def analyze_trends(self):
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
    
    async def run_forever(self):
        """Main monitoring loop"""
        logging.info("🚀 Observer daemon starting...")
        
        while True:
            try:
                # Perform health check
                await self.monitor_all_services()
                
                # Analyze trends every 10 minutes
                if len(self.health_history) % 10 == 0:
                    trends = await self.analyze_trends()
                    logging.info(f"📈 System trend: {trends['trend']} (current: {trends['current_score']:.0f}%)")
                
                # Wait before next check
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logging.error(f"❌ Monitoring loop error: {e}")
                await asyncio.sleep(30)  # Shorter wait on error
    
    def get_status(self):
        """Get current observer status"""
        return {
            'services_monitored': len(self.services),
            'health_history_size': len(self.health_history),
            'error_patterns': len(self.error_patterns),
            'alert_threshold': self.alert_threshold,
            'last_check': self.health_history[-1]['timestamp'] if self.health_history else None,
            'uptime': datetime.now().isoformat()
        }

async def main():
    """Main entry point"""
    observer = HeadyObserver()
    
    # Handle graceful shutdown
    def signal_handler(signum, frame):
        logging.info("🛑 Observer daemon shutting down...")
        sys.exit(0)
    
    import signal
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    # Start monitoring
    await observer.run_forever()

if __name__ == "__main__":
    asyncio.run(main())
