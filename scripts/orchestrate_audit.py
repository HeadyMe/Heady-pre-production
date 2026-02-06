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
# ║  FILE: scripts/orchestrate_audit.py                               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

"""
Orchestrate comprehensive audit system for Heady ecosystem.
Integrates system health, security scanning, and audit trail management.
"""

import sys
import os
from pathlib import Path
import json
from datetime import datetime

# Add src to path for imports
sys.path.append(str(Path(__file__).parent.parent / "src"))

try:
    from heady_project.audit import audit_manager, full_audit
    from HeadyAcademy.Tools.Security_Audit import audit as security_audit
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure you're running from the Heady root directory")
    sys.exit(1)

class AuditOrchestrator:
    """Comprehensive audit orchestration system"""
    
    def __init__(self, project_root: Path = None):
        self.project_root = project_root or Path.cwd()
        self.start_time = datetime.now()
        
    def run_comprehensive_audit(self) -> dict:
        """Run complete audit suite"""
        print(f"🔍 Starting comprehensive audit at {self.start_time}")
        print(f"📁 Project root: {self.project_root}")
        
        results = {
            "start_time": self.start_time.isoformat(),
            "project_root": str(self.project_root),
            "audits": {}
        }
        
        # 1. System Health Audit
        print("\n📊 Running system health audit...")
        try:
            health_metrics = full_audit(self.project_root)
            results["audits"]["system_health"] = {
                "status": "SUCCESS",
                "metrics": health_metrics
            }
            print("✅ System health audit completed")
        except Exception as e:
            results["audits"]["system_health"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ System health audit failed: {e}")
        
        # 2. Security Audit
        print("\n🔒 Running security audit...")
        try:
            security_report_path = security_audit(str(self.project_root))
            
            # Parse security report
            with open(security_report_path, 'r', encoding='utf-8') as f:
                report_content = f.read()
            
            # Extract summary from report
            lines = report_content.split('\n')
            summary = {}
            for line in lines:
                if line.startswith('- 🔴 HIGH:'):
                    summary['high'] = int(line.split(':')[-1].strip())
                elif line.startswith('- 🟡 MEDIUM:'):
                    summary['medium'] = int(line.split(':')[-1].strip())
                elif line.startswith('- 🟢 LOW:'):
                    summary['low'] = int(line.split(':')[-1].strip())
                elif line.startswith('Files Scanned:'):
                    summary['files_scanned'] = int(line.split(':')[-1].strip())
            
            results["audits"]["security"] = {
                "status": "SUCCESS",
                "report_path": str(security_report_path),
                "summary": summary
            }
            print(f"✅ Security audit completed - {summary.get('high', 0)} HIGH, {summary.get('medium', 0)} MEDIUM issues")
        except Exception as e:
            results["audits"]["security"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Security audit failed: {e}")
        
        # 3. Audit Integrity Check
        print("\n🔐 Validating audit integrity...")
        try:
            integrity = audit_manager.validate_audit_integrity()
            results["audits"]["integrity"] = {
                "status": "SUCCESS" if integrity["valid"] else "WARNING",
                "result": integrity
            }
            print(f"{'✅' if integrity['valid'] else '⚠️'} Audit integrity: {'PASS' if integrity['valid'] else 'FAIL'}")
        except Exception as e:
            results["audits"]["integrity"] = {
                "status": "ERROR",
                "error": str(e)
            }
            print(f"❌ Integrity check failed: {e}")
        
        # 4. Generate Summary
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        results.update({
            "end_time": end_time.isoformat(),
            "duration_seconds": duration,
            "overall_status": self._calculate_overall_status(results["audits"])
        })
        
        # Save comprehensive report
        self._save_comprehensive_report(results)
        
        # Print summary
        self._print_summary(results)
        
        return results
    
    def _calculate_overall_status(self, audits: dict) -> str:
        """Calculate overall audit status"""
        statuses = [audit.get("status", "ERROR") for audit in audits.values()]
        
        if all(status == "SUCCESS" for status in statuses):
            return "SUCCESS"
        elif any(status == "ERROR" for status in statuses):
            return "ERROR"
        else:
            return "WARNING"
    
    def _save_comprehensive_report(self, results: dict):
        """Save comprehensive audit report"""
        reports_dir = Path("HeadyAcademy/Logs/Comprehensive_Audits")
        reports_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = reports_dir / f"comprehensive_audit_{timestamp}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"📋 Comprehensive report saved: {report_file}")
    
    def _print_summary(self, results: dict):
        """Print audit summary"""
        print("\n" + "="*60)
        print("🎯 COMPREHENSIVE AUDIT SUMMARY")
        print("="*60)
        
        print(f"⏱️  Duration: {results['duration_seconds']:.2f} seconds")
        print(f"📊 Overall Status: {results['overall_status']}")
        
        for audit_name, audit_result in results["audits"].items():
            status_icon = {"SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌"}.get(audit_result["status"], "❓")
            print(f"{status_icon} {audit_name.replace('_', ' ').title()}: {audit_result['status']}")
            
            if audit_name == "security" and audit_result["status"] == "SUCCESS":
                summary = audit_result["summary"]
                print(f"   🔴 HIGH: {summary.get('high', 0)}")
                print(f"   🟡 MEDIUM: {summary.get('medium', 0)}")
                print(f"   🟢 LOW: {summary.get('low', 0)}")
        
        print("="*60)

def main():
    """Main entry point"""
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    
    orchestrator = AuditOrchestrator(Path(target))
    results = orchestrator.run_comprehensive_audit()
    
    # Exit with appropriate code
    exit_code = {"SUCCESS": 0, "WARNING": 1, "ERROR": 2}.get(results["overall_status"], 2)
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
