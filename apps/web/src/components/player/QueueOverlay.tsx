'use client';

import { useState, useEffect } from 'react';
import { usePlayer } from './usePlayer';
import { X } from 'lucide-react';

export default function QueueOverlay() {
  const [open, setOpen] = useState(false);
  const s = usePlayer();

  useEffect(() => {
    if (open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setOpen(false);
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  if (s.queue.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className="fixed bottom-16 right-4 btn z-[55]"
        aria-haspopup="dialog"
        aria-controls="queue"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        Queue ({s.queue.length})
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          id="queue"
          aria-labelledby="queue-title"
          className="fixed inset-0 z-[70] bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-3xl rounded-t-2xl bg-surface border border-border p-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 id="queue-title" className="text-lg font-semibold">
                Up next
              </h2>
              <button
                className="btn"
                onClick={() => setOpen(false)}
                aria-label="Close queue"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <ul className="overflow-auto divide-y divide-border flex-1">
              {s.queue.map((t, idx) => (
                <li
                  key={t.id}
                  className={`p-3 ${
                    idx === s.index ? 'bg-surface2' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{t.title}</div>
                      <div className="truncate text-sm text-muted">
                        {t.artistName}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="btn text-sm"
                        onClick={() => {
                          s.play(idx);
                        }}
                        aria-label={`Play ${t.title}`}
                      >
                        Play
                      </button>
                      <button
                        className="btn text-sm"
                        onClick={() => {
                          const q = s.queue.slice();
                          q.splice(idx, 1);
                          const newIndex =
                            idx <= s.index
                              ? Math.max(0, s.index - 1)
                              : s.index;
                          usePlayer.setState({
                            queue: q,
                            index: q.length > 0 ? newIndex : -1,
                          });
                        }}
                        aria-label={`Remove ${t.title} from queue`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

