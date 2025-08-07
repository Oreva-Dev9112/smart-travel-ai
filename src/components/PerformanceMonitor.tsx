'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initPerformanceMonitoring, recordMetric, METRICS } from '@/lib/performance';

/**
 * Component that initializes and manages performance monitoring
 * This should be included near the root of your application
 */
export default function PerformanceMonitor() {
  const pathname = usePathname();
  
  // Initialize performance monitoring on mount
  useEffect(() => {
    initPerformanceMonitoring();
  }, []);
  
  // Track route changes
  useEffect(() => {
    // Record the time when a route change completes
    const routeChangeCompleteTime = performance.now();
    recordMetric(METRICS.ROUTE_CHANGE_TIME, routeChangeCompleteTime);
    
    // Mark the route change in performance timeline for devtools
    if (typeof performance !== 'undefined' && 'mark' in performance) {
      performance.mark(`route-change-to-${pathname}`);
    }
  }, [pathname]);
  
  // This component doesn't render anything
  return null;
}