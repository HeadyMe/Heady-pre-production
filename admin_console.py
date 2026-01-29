#!/usr/bin/env python3
"""
Admin Console - Administrative interface for Heady system operations.

This console provides API management, audit functionality, real-time monitoring,
and AI-powered insights using Hugging Face models.
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, List, Optional
import requests

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class HeadyAdminConsole:
    """
    Administrative console for Heady system operations.
    
    Attributes:
        api_url: Base URL for the Heady API
        api_key: API key for authentication
        audit_log_path: Path to audit log file
    """
    
    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        audit_log_path: Optional[str] = None
    ):
        """
        Initialize the admin console.
        
        Args:
            api_url: Base URL for Heady API (defaults to env var or localhost)
            api_key: API key (defaults to env var)
            audit_log_path: Path to audit log (defaults to ./audit_log.jsonl)
        """
        self.api_url = api_url or os.getenv("HEADY_API_URL", "http://localhost:3300")
        self.api_key = api_key or os.getenv("HEADY_API_KEY")
        self.audit_log_path = Path(audit_log_path or os.getenv("AUDIT_LOG_PATH", "./audit_log.jsonl"))
        
        # Ensure audit log directory exists
        self.audit_log_path.parent.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Initialized admin console for {self.api_url}")
    
    def _make_request(
        self,
        endpoint: str,
        method: str = "GET",
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make an authenticated request to the Heady API.
        
        Args:
            endpoint: API endpoint path
            method: HTTP method
            data: Optional request body data
            
        Returns:
            Response data as dictionary
            
        Raises:
            requests.HTTPError: If request fails
        """
        url = f"{self.api_url}{endpoint}"
        headers = {}
        
        if self.api_key:
            headers["x-heady-api-key"] = self.api_key
        
        logger.debug(f"{method} {url}")
        
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            headers["Content-Type"] = "application/json"
            response = requests.post(url, headers=headers, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        response.raise_for_status()
        return response.json()
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check the health status of the Heady API.
        
        Returns:
            Health status dictionary
        """
        logger.info("Performing health check...")
        
        try:
            result = self._make_request("/api/health")
            
            if result.get("ok"):
                logger.info("✓ API is healthy")
            else:
                logger.warning("⚠ API returned unhealthy status")
            
            return result
            
        except Exception as e:
            logger.error(f"✗ Health check failed: {e}")
            return {"ok": False, "error": str(e)}
    
    def pulse_check(self) -> Dict[str, Any]:
        """
        Check detailed system pulse including Docker status.
        
        Returns:
            Pulse status dictionary
        """
        logger.info("Performing pulse check...")
        
        try:
            result = self._make_request("/api/pulse")
            
            docker_ok = result.get("docker", {}).get("ok", False)
            if docker_ok:
                logger.info("✓ Docker is available")
            else:
                logger.warning("⚠ Docker is not available")
            
            return result
            
        except Exception as e:
            logger.error(f"✗ Pulse check failed: {e}")
            return {"ok": False, "error": str(e)}
    
    def audit_log(self, event: str, details: Dict[str, Any]) -> None:
        """
        Log an audit event.
        
        Args:
            event: Event type/name
            details: Event details dictionary
        """
        audit_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event,
            "details": details
        }
        
        try:
            with open(self.audit_log_path, 'a', encoding='utf-8') as f:
                f.write(json.dumps(audit_entry) + '\n')
            
            logger.info(f"Audit logged: {event}")
            
        except IOError as e:
            logger.error(f"Failed to write audit log: {e}")
    
    def read_audit_log(
        self,
        limit: int = 100,
        event_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Read recent audit log entries.
        
        Args:
            limit: Maximum number of entries to return
            event_filter: Optional event type filter
            
        Returns:
            List of audit log entries
        """
        if not self.audit_log_path.exists():
            logger.warning("Audit log file does not exist")
            return []
        
        entries = []
        
        try:
            with open(self.audit_log_path, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        entry = json.loads(line.strip())
                        
                        if event_filter and entry.get("event") != event_filter:
                            continue
                        
                        entries.append(entry)
                        
                        if len(entries) >= limit:
                            break
                            
                    except json.JSONDecodeError:
                        logger.warning(f"Skipping invalid audit log line")
                        continue
            
            logger.info(f"Read {len(entries)} audit log entries")
            return entries[-limit:]  # Return most recent entries
            
        except IOError as e:
            logger.error(f"Failed to read audit log: {e}")
            return []
    
    def monitor(self, interval: int = 30, duration: Optional[int] = None) -> None:
        """
        Monitor system health in real-time.
        
        Args:
            interval: Check interval in seconds
            duration: Optional monitoring duration in seconds (infinite if None)
        """
        import time
        
        logger.info(f"Starting monitoring (interval: {interval}s)")
        
        start_time = time.time()
        check_count = 0
        
        try:
            while True:
                check_count += 1
                logger.info(f"\n--- Check #{check_count} ---")
                
                health = self.health_check()
                pulse = self.pulse_check()
                
                # Log monitoring event
                self.audit_log("system_monitor", {
                    "check_number": check_count,
                    "health": health.get("ok", False),
                    "docker_available": pulse.get("docker", {}).get("ok", False)
                })
                
                # Check if duration exceeded
                if duration and (time.time() - start_time) >= duration:
                    logger.info(f"Monitoring duration {duration}s reached")
                    break
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("\nMonitoring stopped by user")
    
    def summarize_logs(
        self,
        limit: int = 100,
        use_ai: bool = True
    ) -> Dict[str, Any]:
        """
        Summarize audit logs using AI if available.
        
        Args:
            limit: Number of log entries to analyze
            use_ai: Whether to use Hugging Face for summarization
            
        Returns:
            Dictionary with summary and statistics
        """
        logger.info(f"Summarizing last {limit} audit log entries")
        
        entries = self.read_audit_log(limit=limit)
        
        if not entries:
            return {"summary": "No log entries found", "count": 0}
        
        # Basic statistics
        event_counts = {}
        for entry in entries:
            event = entry.get("event", "unknown")
            event_counts[event] = event_counts.get(event, 0) + 1
        
        summary_data = {
            "total_entries": len(entries),
            "event_types": len(event_counts),
            "event_breakdown": event_counts,
            "time_range": {
                "start": entries[0].get("timestamp") if entries else None,
                "end": entries[-1].get("timestamp") if entries else None
            }
        }
        
        # AI-powered summarization
        if use_ai:
            try:
                from heady_project.hf_utils import HuggingFaceUtils
                
                hf_utils = HuggingFaceUtils()
                
                # Create text summary of events
                log_text = "\n".join([
                    f"{e.get('timestamp')}: {e.get('event')} - {e.get('details')}"
                    for e in entries[:50]  # Limit to avoid token limits
                ])
                
                ai_summary = hf_utils.summarize_text(log_text, max_length=150)
                summary_data["ai_summary"] = ai_summary
                
            except Exception as e:
                logger.warning(f"AI summarization failed: {e}")
                summary_data["ai_summary"] = None
        
        return summary_data
    
    def ask_question(
        self,
        question: str,
        context_source: str = "README"
    ) -> Dict[str, Any]:
        """
        Answer questions using AI based on project documentation.
        
        Args:
            question: User's question
            context_source: Source of context (README, audit logs, etc.)
            
        Returns:
            Dictionary with answer and confidence score
        """
        logger.info(f"Answering question: {question}")
        
        try:
            from heady_project.hf_utils import HuggingFaceUtils
            
            hf_utils = HuggingFaceUtils()
            
            # Load context based on source
            if context_source == "README":
                context_file = Path(__file__).parent / "README.md"
                if context_file.exists():
                    with open(context_file, 'r') as f:
                        context = f.read()
                else:
                    context = "Project documentation not found."
            elif context_source == "audit":
                entries = self.read_audit_log(limit=50)
                context = "\n".join([
                    f"{e.get('event')}: {e.get('details')}"
                    for e in entries
                ])
            else:
                context = "No context available."
            
            result = hf_utils.answer_question(question, context)
            
            return {
                "question": question,
                "answer": result["answer"],
                "confidence": result["score"],
                "source": context_source
            }
            
        except Exception as e:
            logger.error(f"Question answering failed: {e}")
            return {
                "question": question,
                "answer": "I couldn't answer that question. Please check the documentation.",
                "confidence": 0.0,
                "source": context_source,
                "error": str(e)
            }


def main() -> int:
    """
    Main entry point for the admin console.
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    parser = argparse.ArgumentParser(
        description="Heady Admin Console - System administration and auditing"
    )
    parser.add_argument(
        "--api-url",
        help="Heady API base URL"
    )
    parser.add_argument(
        "--api-key",
        help="Heady API key for authentication"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Health check command
    subparsers.add_parser("health", help="Check API health status")
    
    # Pulse check command
    subparsers.add_parser("pulse", help="Check detailed system pulse")
    
    # Audit log command
    audit_parser = subparsers.add_parser("audit", help="View audit log")
    audit_parser.add_argument("--limit", type=int, default=100, help="Number of entries to show")
    audit_parser.add_argument("--event", help="Filter by event type")
    
    # Monitor command
    monitor_parser = subparsers.add_parser("monitor", help="Monitor system in real-time")
    monitor_parser.add_argument("--interval", type=int, default=30, help="Check interval in seconds")
    monitor_parser.add_argument("--duration", type=int, help="Monitoring duration in seconds")
    
    # Summarize logs command (NEW)
    summarize_parser = subparsers.add_parser("summarize", help="Summarize audit logs with AI")
    summarize_parser.add_argument("--limit", type=int, default=100, help="Number of entries to analyze")
    summarize_parser.add_argument("--no-ai", action="store_true", help="Disable AI summarization")
    
    # Ask question command (NEW)
    ask_parser = subparsers.add_parser("ask", help="Ask a question about the project")
    ask_parser.add_argument("question", help="Your question")
    ask_parser.add_argument("--source", default="README", choices=["README", "audit"], help="Context source")
    
    args = parser.parse_args()
    
    # Initialize console
    console = HeadyAdminConsole(
        api_url=args.api_url,
        api_key=args.api_key
    )
    
    # Execute command
    try:
        if args.command == "health":
            result = console.health_check()
            print(json.dumps(result, indent=2))
            return 0 if result.get("ok") else 1
            
        elif args.command == "pulse":
            result = console.pulse_check()
            print(json.dumps(result, indent=2))
            return 0 if result.get("ok") else 1
            
        elif args.command == "audit":
            entries = console.read_audit_log(
                limit=args.limit,
                event_filter=args.event
            )
            print(json.dumps(entries, indent=2))
            return 0
            
        elif args.command == "monitor":
            console.monitor(
                interval=args.interval,
                duration=args.duration
            )
            return 0
        
        elif args.command == "summarize":
            result = console.summarize_logs(
                limit=args.limit,
                use_ai=not args.no_ai
            )
            print(json.dumps(result, indent=2))
            return 0
        
        elif args.command == "ask":
            result = console.ask_question(
                question=args.question,
                context_source=args.source
            )
            print(json.dumps(result, indent=2))
            return 0
            
        else:
            parser.print_help()
            return 1
            
    except Exception as e:
        logger.error(f"Command failed: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
