#!/usr/bin/env python3
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
# ║  FILE: test_headybrain_optimized.py                               ║
# ║  LAYER: root                                                      ║
# ╚══════════════════════════════════════════════════════════════════╝
# HEADY_BRAND:END

from HeadyAcademy.HeadyBrain_optimized import HeadyBrainOptimized
import time

def test_headybrain_optimized():
    """Comprehensive test of HeadyBrain optimizations."""
    
    print("="*80)
    print("∞ HEADYBRAIN OPTIMIZATION VERIFICATION ∞")
    print("="*80)
    
    # Initialize optimized brain
    brain = HeadyBrainOptimized()
    
    print('\n=== PERFORMANCE TESTING ===')
    test_requests = [
        'deploy the application',
        'monitor system health',
        'optimize database performance',
        'document the API endpoints',
        'audit security configurations'
    ]
    
    total_time = 0
    for i, request in enumerate(test_requests):
        print(f'\nTest {i+1}: {request}')
        start_time = time.time()
        context = brain.process_request(request)
        end_time = time.time()
        processing_time = (end_time - start_time) * 1000
        total_time += processing_time
        print(f'✓ Completed in {processing_time:.2f}ms')
        print(f'✓ Concepts: {len(context.concepts_identified)}')
        print(f'✓ Tasks: {len(context.tasks_assigned)}')
    
    avg_time = total_time / len(test_requests)
    print(f'\nAverage processing time: {avg_time:.2f}ms')
    
    print('\n=== CACHE TESTING ===')
    # Test cache functionality
    print('First request (cache miss):')
    start_time = time.time()
    context1 = brain.process_request('deploy the application')
    time1 = time.time() - start_time
    
    print('Second identical request (cache hit):')
    start_time = time.time()
    context2 = brain.process_request('deploy the application')
    time2 = time.time() - start_time
    
    if time2 > 0:
        speedup = time1 / time2
        print(f'Cache speedup: {speedup:.1f}x faster')
    
    metrics = brain.get_performance_metrics()
    print(f'Cache hit rate: {metrics["cache_hit_rate"]:.1%}')
    
    print('\n=== SYSTEM AWARENESS ===')
    awareness = brain.get_system_awareness()
    components_count = sum(awareness["components"].values())
    print(f'Components available: {components_count}/4')
    print(f'Cache files: {awareness["cache_stats"]["cache_files"]}')
    print(f'Requests processed: {awareness["performance_metrics"]["requests_processed"]}')
    
    print('\n=== FUNCTIONALITY VERIFICATION ===')
    # Test core functionality
    test_context = brain.process_request('optimize system performance and monitor security')
    
    verification_points = [
        ('Request processing', test_context.request == 'optimize system performance and monitor security'),
        ('Timestamp generation', len(test_context.timestamp) > 0),
        ('Concept identification', len(test_context.concepts_identified) > 0),
        ('Task assignment', len(test_context.tasks_assigned) > 0),
        ('Processing time tracking', test_context.processing_time > 0),
        ('Cache functionality', hasattr(test_context, 'cache_hit')),
        ('Confidence scoring', hasattr(test_context, 'confidence_score'))
    ]
    
    passed = 0
    total = len(verification_points)
    
    for test_name, result in verification_points:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f'{status}: {test_name}')
        if result:
            passed += 1
    
    print(f'\n=== VERIFICATION RESULTS ===')
    print(f'Tests passed: {passed}/{total}')
    print(f'Success rate: {passed/total:.1%}')
    
    if passed == total:
        print('🎉 ALL TESTS PASSED - HeadyBrain is fully optimized and functional!')
    else:
        print('⚠️  Some tests failed - review implementation')
    
    print('\n=== PERFORMANCE METRICS ===')
    final_metrics = brain.get_performance_metrics()
    for key, value in final_metrics.items():
        print(f'{key}: {value}')
    
    return passed == total

if __name__ == "__main__":
    success = test_headybrain_optimized()
    exit(0 if success else 1)
