'use client';

import { create } from 'zustand';
import { useAnalytics } from '../hooks/useAnalytics';

export type CrateRow = {
  title: string;
  artist: string;
  bpm?: number | null;
  key?: string | null;
  url?: string | null;
};

type CrateStore = {
  rows: CrateRow[];
  add: (r: CrateRow) => void;
  remove: (i: number) => void;
  clear: () => void;
};

export const useCrate = create<CrateStore>((set) => ({
  rows: [],
  add: (r) =>
    set((s) => ({
      rows: [...s.rows, r],
    })),
  remove: (i) =>
    set((s) => ({
      rows: s.rows.filter((_, k) => k !== i),
    })),
  clear: () => set({ rows: [] }),
}));

export function CratePanel() {
  const { rows, remove, clear } = useCrate();
  const { track } = useAnalytics();

  const csv =
    'Title,Artist,BPM,Key,URL\n' +
    rows
      .map((r) =>
        [
          r.title,
          r.artist,
          r.bpm ?? '',
          r.key ?? '',
          r.url ?? '',
        ].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const href = URL.createObjectURL(blob);

  const handleExport = () => {
    track({
      type: 'crate_export',
      data: { rows: rows.length },
    });
  };

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-[60] rounded-2xl border border-border bg-surface/95 p-3 shadow-lg max-w-sm">
      <div className="text-sm text-muted mb-2">Crate: {rows.length}</div>
      <div className="mt-2 flex gap-2">
        <a
          className="btn text-sm"
          href={href}
          download="crate.csv"
          aria-label="Export crate as CSV"
          onClick={handleExport}
        >
          Export CSV
        </a>
        <button
          className="btn text-sm"
          onClick={clear}
          aria-label="Clear crate"
        >
          Clear
        </button>
      </div>
      <ul className="mt-2 max-h-48 overflow-auto text-sm space-y-1">
        {rows.map((r, idx) => (
          <li
            key={idx}
            className="flex justify-between gap-2 py-1 items-center"
          >
            <span className="truncate text-text">
              {r.artist} — {r.title}
            </span>
            <button
              className="text-muted hover:text-text hover:underline text-xs flex-shrink-0"
              onClick={() => remove(idx)}
              aria-label={`Remove ${r.title} from crate`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

