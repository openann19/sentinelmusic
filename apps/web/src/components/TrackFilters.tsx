'use client';

import { useMemo, useState, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  bpm?: number;
  keyText?: string;
  durationSeconds?: number | null;
}

type SortOption = 'bpm' | 'key' | 'date' | 'title';

interface TrackFiltersProps {
  tracks: Track[];
  render: (rows: Track[]) => ReactNode;
}

const KEY_OPTIONS = [
  '1A',
  '1B',
  '2A',
  '2B',
  '3A',
  '3B',
  '4A',
  '4B',
  '5A',
  '5B',
  '6A',
  '6B',
  '7A',
  '7B',
  '8A',
  '8B',
  '9A',
  '9B',
  '10A',
  '10B',
  '11A',
  '11B',
  '12A',
  '12B',
];

export function TrackFilters({ tracks, render }: TrackFiltersProps) {
  const [bpmMin, setBpmMin] = useState<number | ''>('');
  const [bpmMax, setBpmMax] = useState<number | ''>('');
  const [key, setKey] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('title');

  const rows = useMemo(() => {
    let filtered = tracks.filter((t) => {
      const okMin = bpmMin === '' || (t.bpm ?? 0) >= bpmMin;
      const okMax = bpmMax === '' || (t.bpm ?? 0) <= bpmMax;
      const okKey = !key || t.keyText === key;
      return okMin && okMax && okKey;
    });

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'bpm':
          return (a.bpm ?? 0) - (b.bpm ?? 0);
        case 'key':
          return (a.keyText ?? '').localeCompare(b.keyText ?? '');
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tracks, bpmMin, bpmMax, key, sortBy]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end flex-wrap">
        <label className="text-sm">
          BPM
          <input
            type="number"
            className="ml-2 w-20 rounded bg-surface border border-border px-2 py-1 text-text"
            value={bpmMin}
            onChange={(e) =>
              setBpmMin(e.target.value === '' ? '' : Number(e.target.value))
            }
            placeholder="min"
            aria-label="BPM minimum"
          />
        </label>
        <input
          type="number"
          className="w-20 rounded bg-surface border border-border px-2 py-1 text-text"
          value={bpmMax}
          onChange={(e) =>
            setBpmMax(e.target.value === '' ? '' : Number(e.target.value))
          }
          placeholder="max"
          aria-label="BPM maximum"
        />
        <select
          className="rounded bg-surface border border-border px-2 py-1 text-text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          aria-label="Key filter"
        >
          <option value="">Any key</option>
          {KEY_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          className="rounded bg-surface border border-border px-2 py-1 text-text"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          aria-label="Sort by"
        >
          <option value="title">Sort by Title</option>
          <option value="bpm">Sort by BPM</option>
          <option value="key">Sort by Key</option>
        </select>
      </div>
      {render(rows)}
    </div>
  );
}

