export interface Metric {
  // The name of the metric (in acronym form).
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';

  // The current value of the metric.
  value: number;

 
  delta: number;

  
  id: string;

  // Any performance entries used in the metric value calculation.
  // Note, entries will be added to the array as the value changes.
  entries: (PerformanceEntry | FirstInputPolyfillEntry | NavigationTimingPolyfillEntry)[];
}

export interface ReportHandler {
  (metric: Metric): void;
}

// https://wicg.github.io/event-timing/#sec-performance-event-timing
export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: DOMHighResTimeStamp;
  processingEnd: DOMHighResTimeStamp;
  duration: DOMHighResTimeStamp;
  cancelable?: boolean;
  target?: Element;
}

export type FirstInputPolyfillEntry =
    Omit<PerformanceEventTiming, 'processingEnd' | 'toJSON'>

export interface FirstInputPolyfillCallback {
  (entry: FirstInputPolyfillEntry): void;
}

export type NavigationTimingPolyfillEntry = Omit<PerformanceNavigationTiming,
    'initiatorType' | 'nextHopProtocol' | 'redirectCount' | 'transferSize' |
    'encodedBodySize' | 'decodedBodySize' | 'toJSON'>

export interface WebVitalsGlobal {
  firstInputPolyfill: (onFirstInput: FirstInputPolyfillCallback) => void;
  resetFirstInputPolyfill: () => void;
  firstHiddenTime: number;
}

declare global {
  interface Window {
    webVitals: WebVitalsGlobal;

    // Build flags:
    __WEB_VITALS_POLYFILL__: boolean;
  }
}
