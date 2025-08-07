'use client';

/**
 * Performance monitoring utilities for the Smart Travel application
 * This module provides tools to measure and report performance metrics
 */

// Constants for metric names
export const METRICS = {
  // Page load metrics
  FCP: 'first-contentful-paint',
  LCP: 'largest-contentful-paint',
  FID: 'first-input-delay',
  CLS: 'cumulative-layout-shift',
  TTFB: 'time-to-first-byte',
  
  // Custom metrics
  API_RESPONSE_TIME: 'api-response-time',
  ITINERARY_GENERATION_TIME: 'itinerary-generation-time',
  ROUTE_CHANGE_TIME: 'route-change-time',
};

// Store for collected metrics
const metrics: Record<string, number[]> = {};

/**
 * Initialize performance monitoring
 * Sets up web vitals and custom performance observers
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  try {
    // Set up performance observer for web vitals
    if ('PerformanceObserver' in window) {
      // Observe paint metrics (FCP, LCP)
      const paintObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            recordMetric(METRICS.FCP, entry.startTime);
          } else if (entry.name === 'largest-contentful-paint') {
            recordMetric(METRICS.LCP, entry.startTime);
          }
        });
      });
      paintObserver.observe({ type: 'paint', buffered: true });
      
      // Observe layout shifts (CLS)
      const layoutShiftObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        recordMetric(METRICS.CLS, clsValue);
      });
      layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
      
      // Observe first input delay (FID)
      const firstInputObserver = new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          recordMetric(METRICS.FID, entry.processingStart - entry.startTime);
        });
      });
      firstInputObserver.observe({ type: 'first-input', buffered: true });
      
      // Observe navigation timing (TTFB)
      const navigationObserver = new PerformanceObserver((entryList) => {
        const navigationEntry = entryList.getEntriesByType('navigation')[0] as any;
        if (navigationEntry) {
          recordMetric(METRICS.TTFB, navigationEntry.responseStart - navigationEntry.requestStart);
        }
      });
      navigationObserver.observe({ type: 'navigation', buffered: true });
    }
    
    console.log('Performance monitoring initialized');
  } catch (error) {
    console.error('Failed to initialize performance monitoring:', error);
  }
}

/**
 * Record a performance metric
 * @param name - The name of the metric
 * @param value - The value to record
 */
export function recordMetric(name: string, value: number) {
  if (!metrics[name]) {
    metrics[name] = [];
  }
  metrics[name].push(value);
  
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.debug(`Performance metric: ${name} = ${value}`);
  }
}

/**
 * Measure the execution time of a function
 * @param fn - The function to measure
 * @param metricName - The name to use for the metric
 * @returns The result of the function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T> | T,
  metricName: string
): Promise<T> {
  const startTime = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - startTime;
    recordMetric(metricName, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    recordMetric(`${metricName}-error`, duration);
    throw error;
  }
}

/**
 * Get the average value for a metric
 * @param name - The name of the metric
 * @returns The average value, or null if no values have been recorded
 */
export function getAverageMetric(name: string): number | null {
  const values = metrics[name];
  if (!values || values.length === 0) return null;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Get all recorded metrics
 * @returns An object containing all metrics with their average values
 */
export function getAllMetrics(): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  
  Object.keys(metrics).forEach((name) => {
    result[name] = getAverageMetric(name);
  });
  
  return result;
}

/**
 * Clear all recorded metrics
 */
export function clearMetrics(): void {
  Object.keys(metrics).forEach((name) => {
    metrics[name] = [];
  });
}

// Export a hook for measuring API call performance
export function measureApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  return measureExecutionTime(apiCall, `api-${endpoint}`);
}