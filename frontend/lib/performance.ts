// SAYU 성능 모니터링 유틸리티

interface WebVitalMetric {
  id: string;
  name: string;
  label: string;
  value: number;
  delta?: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

class SAYUPerformanceMonitor {
  private metrics: Map<string, WebVitalMetric> = new Map();
  private startTime: number = performance.now();
  
  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Core Web Vitals 모니터링
    if (typeof window !== 'undefined') {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric({
          id: 'lcp',
          name: 'LCP',
          label: 'web-vital',
          value: lastEntry.startTime,
          rating: this.getRating('lcp', lastEntry.startTime)
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          this.recordMetric({
            id: 'fid',
            name: 'FID',
            label: 'web-vital',
            value: entry.processingStart - entry.startTime,
            rating: this.getRating('fid', entry.processingStart - entry.startTime)
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.recordMetric({
              id: 'cls',
              name: 'CLS',
              label: 'web-vital',
              value: clsValue,
              rating: this.getRating('cls', clsValue)
            });
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  recordMetric(metric: WebVitalMetric) {
    this.metrics.set(metric.id, metric);
    
    // 성능 데이터를 백엔드로 전송 (프로덕션에서만)
    if (process.env.NODE_ENV === 'production') {
      this.sendMetrics(metric);
    }

    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [SAYU Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    }
  }

  private async sendMetrics(metric: WebVitalMetric) {
    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metric,
          timestamp: Date.now(),
          url: window.location.pathname,
          userAgent: navigator.userAgent,
          connection: (navigator as any).connection?.effectiveType || 'unknown'
        })
      });
    } catch (error) {
      // 성능 모니터링 실패는 조용히 처리
      console.warn('Performance metric sending failed:', error);
    }
  }

  // 커스텀 성능 메트릭 측정
  measureCustomMetric(name: string, fn: () => Promise<any> | any) {
    const start = performance.now();
    
    const result = fn();
    
    if (result && typeof result.then === 'function') {
      // Promise인 경우
      return result.finally(() => {
        const duration = performance.now() - start;
        this.recordMetric({
          id: `custom-${name}`,
          name: `Custom: ${name}`,
          label: 'custom',
          value: duration,
          rating: duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor'
        });
      });
    } else {
      // 동기 함수인 경우
      const duration = performance.now() - start;
      this.recordMetric({
        id: `custom-${name}`,
        name: `Custom: ${name}`,
        label: 'custom',
        value: duration,
        rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor'
      });
      return result;
    }
  }

  // API 호출 성능 측정
  measureAPICall(endpoint: string, fetchPromise: Promise<Response>) {
    const start = performance.now();
    
    return fetchPromise
      .then(response => {
        const duration = performance.now() - start;
        this.recordMetric({
          id: `api-${endpoint}`,
          name: `API: ${endpoint}`,
          label: 'api',
          value: duration,
          rating: duration < 500 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor'
        });
        return response;
      })
      .catch(error => {
        const duration = performance.now() - start;
        this.recordMetric({
          id: `api-error-${endpoint}`,
          name: `API Error: ${endpoint}`,
          label: 'api-error',
          value: duration,
          rating: 'poor'
        });
        throw error;
      });
  }

  // 컴포넌트 렌더링 성능 측정
  measureComponentRender(componentName: string) {
    const start = performance.now();
    
    return {
      finish: () => {
        const duration = performance.now() - start;
        this.recordMetric({
          id: `component-${componentName}`,
          name: `Component: ${componentName}`,
          label: 'component',
          value: duration,
          rating: duration < 16 ? 'good' : duration < 50 ? 'needs-improvement' : 'poor'
        });
      }
    };
  }

  // 전체 성능 요약 반환
  getPerformanceSummary(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {};
    
    for (const [key, metric] of this.metrics.entries()) {
      switch (key) {
        case 'fcp':
          metrics.fcp = metric.value;
          break;
        case 'lcp':
          metrics.lcp = metric.value;
          break;
        case 'fid':
          metrics.fid = metric.value;
          break;
        case 'cls':
          metrics.cls = metric.value;
          break;
        case 'ttfb':
          metrics.ttfb = metric.value;
          break;
      }
    }
    
    return metrics;
  }

  // 성능 경고 체크
  checkPerformanceHealth(): { status: 'good' | 'warning' | 'critical'; issues: string[] } {
    const issues: string[] = [];
    let status: 'good' | 'warning' | 'critical' = 'good';

    for (const [key, metric] of this.metrics.entries()) {
      if (metric.rating === 'poor') {
        issues.push(`${metric.name} is poor (${metric.value.toFixed(2)}ms)`);
        status = 'critical';
      } else if (metric.rating === 'needs-improvement' && status === 'good') {
        issues.push(`${metric.name} needs improvement (${metric.value.toFixed(2)}ms)`);
        status = 'warning';
      }
    }

    return { status, issues };
  }
}

// 싱글톤 인스턴스
let performanceMonitor: SAYUPerformanceMonitor | null = null;

export const getPerformanceMonitor = (): SAYUPerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new SAYUPerformanceMonitor();
  }
  return performanceMonitor;
};

// Next.js의 reportWebVitals와 연동
export function reportWebVitals(metric: WebVitalMetric) {
  const monitor = getPerformanceMonitor();
  monitor.recordMetric(metric);
}

// React Hook for component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = getPerformanceMonitor();
  
  return {
    measureRender: () => monitor.measureComponentRender(componentName),
    measureAPI: (endpoint: string, fetchPromise: Promise<Response>) => 
      monitor.measureAPICall(endpoint, fetchPromise),
    measureCustom: (name: string, fn: () => any) => 
      monitor.measureCustomMetric(name, fn),
  };
};

export default SAYUPerformanceMonitor;