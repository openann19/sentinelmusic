import { useCallback } from 'react';

type EventType =
  | 'search_performed'
  | 'track_preview'
  | 'buy_link_click'
  | 'follow_artist'
  | 'crate_export';

interface AnalyticsEvent {
  type: EventType;
  data: {
    q_len?: number;
    results_count?: number;
    track_id?: string;
    source?: string;
    artist_id?: string;
    rows?: number;
  };
}

const SAMPLING_RATE = 0.1;

function shouldSample(): boolean {
  return Math.random() < SAMPLING_RATE;
}

export function useAnalytics() {
  const track = useCallback(async (event: AnalyticsEvent) => {
    if (!shouldSample()) {
      return;
    }

    try {
      await fetch('/api/v1/events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      // Silently fail - analytics should not break the app
    }
  }, []);

  return { track };
}

