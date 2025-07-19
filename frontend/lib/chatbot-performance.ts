// 챗봇 성능 최적화 유틸리티

// 메시지 캐싱
export class MessageCache {
  private cache: Map<string, { response: string; timestamp: number }>;
  private maxSize: number;
  private ttl: number; // Time to live in ms

  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5분
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): string | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTL 체크
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.response;
  }

  set(key: string, response: string): void {
    // 캐시 크기 제한
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      response,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

// 디바운스 유틸리티
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// 메시지 배칭
export class MessageBatcher {
  private queue: Array<{ message: string; callback: (response: any) => void }> = [];
  private timer: NodeJS.Timeout | null = null;
  private batchSize: number;
  private batchDelay: number;

  constructor(batchSize = 5, batchDelay = 100) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  add(message: string, callback: (response: any) => void): void {
    this.queue.push({ message, callback });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchDelay);
    }
  }

  private flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0, this.batchSize);
    if (batch.length === 0) return;

    // 배치 처리 로직
    this.processBatch(batch);
  }

  private async processBatch(batch: typeof this.queue): Promise<void> {
    // 실제 배치 API 호출은 백엔드에서 구현 필요
    // 여기서는 개별 처리로 시뮬레이션
    batch.forEach(item => {
      // 개별 콜백 실행
      item.callback({ success: true, message: item.message });
    });
  }
}

// 메모리 관리
export class MemoryManager {
  private maxMessages = 100;
  
  cleanupMessages(messages: any[]): any[] {
    if (messages.length <= this.maxMessages) {
      return messages;
    }

    // 오래된 메시지 제거, 최근 메시지는 유지
    return messages.slice(-this.maxMessages);
  }

  // 이미지/미디어 언로드
  unloadMedia(container: HTMLElement): void {
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      if (img.complete && img.naturalHeight !== 0) {
        // 이미지가 뷰포트 밖에 있으면 src 제거
        const rect = img.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          img.dataset.src = img.src;
          img.src = '';
        }
      }
    });
  }

  // 뷰포트에 들어온 이미지 다시 로드
  reloadMedia(container: HTMLElement): void {
    const images = container.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
        img.src = img.dataset.src || '';
        delete img.dataset.src;
      }
    });
  }
}

// 성능 모니터링
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTimer(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // 최대 100개까지만 유지
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  getMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {};
    
    this.metrics.forEach((values, label) => {
      result[label] = {
        avg: this.getAverageMetric(label),
        count: values.length
      };
    });
    
    return result;
  }
}