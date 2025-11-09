import { useState, useCallback } from 'react';

export interface Artist {
  id: string;
  name: string;
  description?: string;
}

export interface TrackLink {
  id: string;
  url: string;
  previewUrl?: string | null;
  source: {
    id: string;
    name: string;
    priority: number;
  };
}

export interface Track {
  id: string;
  title: string;
  bpm?: number;
  keyText?: string;
  durationSeconds?: number | null;
  release: {
    id: string;
    title: string;
    coverUrl?: string | null;
    artist: {
      id: string;
      name: string;
    };
  };
  links: TrackLink[];
}

export interface SearchResults {
  artists: Artist[];
  tracks: Track[];
}

export interface UseSearchReturn {
  results: SearchResults | null;
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export function useSearch(): UseSearchReturn {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults({ artists: [], tracks: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
}

