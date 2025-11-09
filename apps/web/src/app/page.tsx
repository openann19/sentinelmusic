'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayer } from '../components/player/usePlayer';
import { TrackItem } from '../components/player/types';
import PageFade from '../components/PageFade';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import Tip from '../components/ui/Tip';
import BuyMenu from '../components/BuyMenu';
import { useAnalytics } from '../hooks/useAnalytics';

interface Track {
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
  links: Array<{
    id: string;
    url: string;
    previewUrl?: string | null;
    source: {
      id: string;
      name: string;
    };
  }>;
}

interface Artist {
  id: string;
  name: string;
}

interface SearchResults {
  artists: Artist[];
  tracks: Track[];
}

function useDebounce<T>(val: T, ms: number): T {
  const [v, setV] = useState(val);
  useEffect(() => {
    const id = setTimeout(() => setV(val), ms);
    return () => clearTimeout(id);
  }, [val, ms]);
  return v;
}

function queuePreview(track: Track, allTracks: Track[], analyticsTrack?: (event: any) => void) {
  const items: TrackItem[] = allTracks.map((x) => ({
    id: Number(x.id),
    title: x.title,
    artistName: x.release.artist.name,
    coverUrl: x.release.coverUrl ?? null,
    durationSeconds: x.durationSeconds ?? null,
    previewUrl: x.links.find((l) => l.previewUrl)?.previewUrl ?? null,
    links: x.links.map((l) => ({
      id: Number(l.id),
      source: l.source.name,
      url: l.url,
      previewUrl: l.previewUrl ?? null,
    })),
  }));
  const idx = items.findIndex((x) => x.id === Number(track.id));
  const { setQueue } = usePlayer.getState();
  setQueue(items, idx >= 0 ? idx : 0);
  if (analyticsTrack) {
    analyticsTrack({
      type: 'track_preview',
      data: { track_id: track.id },
    });
  }
}

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState<string>('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized) {
      const params = new URLSearchParams(window.location.search);
      const queryParam = params.get('q') ?? '';
      setQ(queryParam);
      setInitialized(true);
    }
  }, [initialized]);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<SearchResults | null>(null);
  const [i, setI] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const { push } = useToast();
  const { track } = useAnalytics();

  const debouncedQ = useDebounce(q, 250);

  useEffect(() => {
    if (!initialized) return;
    if (typeof window === 'undefined') return;

    const sp = new URLSearchParams(window.location.search);
    if (q) {
      sp.set('q', q);
    } else {
      sp.delete('q');
    }
    const newUrl = `/?${sp.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [q, router, initialized]);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.length < 2) {
      setRes(null);
      setI(-1);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedQ)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: SearchResults) => {
        setRes(data);
        setI(-1);
        track({
          type: 'search_performed',
          data: {
            q_len: debouncedQ.length,
            results_count: (data.artists?.length ?? 0) + (data.tracks?.length ?? 0),
          },
        });
      })
      .catch(() => {
        push({ title: 'Search failed', status: 'error' });
        setRes(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [debouncedQ, push, track]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!res?.tracks?.length) return;
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;

      if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowDown') {
        setI((v) => Math.min(res.tracks.length - 1, v + 1));
      }
      if (e.key === 'ArrowUp') {
        setI((v) => Math.max(-1, v - 1));
      }
      if (e.key === 'Enter' && i >= 0 && i < res.tracks.length) {
        const trackItem = res.tracks[i];
        const hasPreview = trackItem.links.some((l) => !!l.previewUrl);
        if (hasPreview) {
          queuePreview(trackItem, res.tracks, track);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [res, i, track]);

  useEffect(() => {
    if (i >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      if (items[i]) {
        (items[i] as HTMLElement).scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [i]);

  return (
    <PageFade>
      <section aria-labelledby="search-heading" className="space-y-6">
        <h1 id="search-heading" className="text-3xl font-bold">
          Discover
        </h1>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex gap-2"
          aria-label="Search tracks and artists"
        >
          <label className="sr-only" htmlFor="q">
            Search music
          </label>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 rounded-xl bg-surface border border-border px-4 py-3 text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent"
            placeholder="Artist or track"
            aria-required="true"
            autoFocus
          />
          <Tip label="Press Enter to preview, ↑/↓ to navigate">
            <span className="px-3 py-2 text-sm text-muted border border-border rounded-xl select-none cursor-help">
              ?
            </span>
          </Tip>
        </form>

        {loading && (
          <div className="grid gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        )}

        {res && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section aria-labelledby="artists" className="space-y-2">
              <h2 id="artists" className="text-xl font-semibold">
                Artists
              </h2>
              {res.artists.length > 0 ? (
                <ul
                  role="list"
                  className="divide-y divide-border rounded-xl border border-border"
                >
                  {res.artists.map((a) => (
                    <li key={a.id} className="p-4 flex items-center justify-between">
                      <a
                        className="hover:underline focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 rounded-xl"
                        href={`/artist/${a.id}`}
                      >
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No artists found</p>
              )}
            </section>

            <section aria-labelledby="tracks" className="space-y-2">
              <h2 id="tracks" className="text-xl font-semibold">
                Tracks
              </h2>
              {res.tracks.length > 0 ? (
                <ul
                  ref={listRef}
                  role="listbox"
                  aria-label="Tracks"
                  className="divide-y divide-border rounded-xl border border-border"
                >
                  {res.tracks.map((t, idx) => {
                    const hasPreview = t.links.some((l) => !!l.previewUrl);
                    return (
                      <li
                        key={t.id}
                        role="option"
                        aria-selected={i === idx}
                        className={`p-4 ${
                          i === idx ? 'bg-surface2' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{t.title}</div>
                            <div className="text-sm text-muted truncate">
                              {t.release.artist.name}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              type="button"
                              data-action="preview"
                              disabled={!hasPreview}
                              aria-disabled={!hasPreview}
                              className="btn text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label={`Preview ${t.title}`}
                              onClick={() => queuePreview(t, res.tracks, track)}
                            >
                              Preview
                            </button>
                            <BuyMenu links={t.links} trackId={t.id} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-muted">No tracks found</p>
              )}
            </section>
          </div>
        )}
      </section>
    </PageFade>
  );
}
