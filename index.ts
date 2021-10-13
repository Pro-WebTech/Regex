import {initMetric} from './lib/initMetric.js';
import {ReportHandler, NavigationTimingPolyfillEntry} from './types.js';


const afterLoad = (callback: () => void) => {
  if (document.readyState === 'complete') {
    // Queue a task so the callback runs after `loadEventEnd`.
    setTimeout(callback, 0);
  } else {
    // Use `pageshow` so the callback runs after `loadEventEnd`.
    addEventListener('pageshow', callback);
  }
}

const getNavigationEntryFromPerformanceTiming = (): NavigationTimingPolyfillEntry => {
  // Really annoying that TypeScript errors when using `PerformanceTiming`.
  const timing = performance.timing;

  const navigationEntry: {[key: string]: number | string} = {
    entryType: 'navigation',
    startTime: 0,
  };

  for (const key in timing) {
    if (key !== 'navigationStart' && key !== 'toJSON') {
      navigationEntry[key] = Math.max(
          (timing[key as keyof PerformanceTiming] as number) -
          timing.navigationStart, 0);
    }
  }
  return navigationEntry as NavigationTimingPolyfillEntry;
};

export const getTTFB = (onReport: ReportHandler) => {
  const metric = initMetric('TTFB');

  afterLoad(() => {
    try {
      // Use the NavigationTiming L2 entry if available.
      const navigationEntry = performance.getEntriesByType('navigation')[0] ||
          getNavigationEntryFromPerformanceTiming();

      metric.value = metric.delta =
          (navigationEntry as PerformanceNavigationTiming).responseStart;

      // In some cases the value reported is negative. Ignore these cases:
      // https://github.com/GoogleChrome/web-vitals/issues/137
      if (metric.value < 0) return;

      metric.entries = [navigationEntry];

      onReport(metric);
    } catch (error) {
      // Do nothing.
    }
  });
};
