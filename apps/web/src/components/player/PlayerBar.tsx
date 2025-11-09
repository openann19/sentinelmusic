'use client';

import { useEffect, useMemo } from 'react';
import { usePlayer } from './usePlayer';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion } from 'framer-motion';

function fmt(sec?: number | null) {
  if (!sec || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerBar() {
  const s = usePlayer();
  const current = s.queue[s.index];

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      const state = usePlayer.getState();
      if (e.code === 'Space') {
        e.preventDefault();
        state.toggle();
      }
      if (e.code === 'ArrowRight') state.seek(state.position + 5);
      if (e.code === 'ArrowLeft') state.seek(Math.max(0, state.position - 5));
      if (e.code === 'ArrowUp')
        state.setVolume(Math.min(1, state.volume + 0.05));
      if (e.code === 'ArrowDown')
        state.setVolume(Math.max(0, state.volume - 0.05));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const progress = useMemo(() => {
    const dur = current?.durationSeconds ?? Math.max(s.buffered, s.position);
    if (!dur || dur === 0) return 0;
    return Math.min(1, s.position / dur);
  }, [s.position, s.buffered, current?.durationSeconds]);

  const bufferedPct = useMemo(() => {
    const dur = (current?.durationSeconds ?? s.buffered) || 0;
    if (!dur) return 0;
    return Math.min(1, s.buffered / dur);
  }, [s.buffered, current?.durationSeconds]);

  if (!current && s.queue.length === 0) {
    return null;
  }

  const repeatLabel =
    s.repeat === 'off'
      ? 'Repeat off'
      : s.repeat === 'one'
        ? 'Repeat one'
        : 'Repeat all';

  return (
    <motion.div
      aria-label="Audio player"
      role="group"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/95 backdrop-blur"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      exit={{ y: 80 }}
      transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 grid grid-cols-1 md:grid-cols-3 items-center gap-3">
        {/* Now playing */}
        <div className="min-w-0">
          <div className="text-sm text-muted truncate">
            {current ? current.artistName : 'Idle'}
          </div>
          <div className="font-medium truncate">
            {current ? current.title : 'Nothing playing'}
          </div>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-2 justify-center">
          <button
            className="btn"
            aria-label="Previous track"
            onClick={s.prev}
            type="button"
          >
            <SkipBack size={18} aria-hidden="true" />
          </button>
          <button
            className="btn btn-primary"
            aria-label={s.playing ? 'Pause' : 'Play'}
            onClick={s.toggle}
            type="button"
          >
            {s.playing ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
          </button>
          <button
            className="btn"
            aria-label="Next track"
            onClick={s.next}
            type="button"
          >
            <SkipForward size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Timeline / Volume */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs tabular-nums text-muted">
            {fmt(s.position)}
          </span>
          <div
            className="relative flex-1 h-3 rounded-full bg-surface2 border border-border min-w-[100px]"
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={
              current?.durationSeconds ?? Math.max(s.buffered, s.position) ?? 0
            }
            aria-valuenow={Math.floor(s.position)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                s.seek(Math.max(0, s.position - 5));
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                s.seek(
                  s.position + 5 < (current?.durationSeconds ?? 0)
                    ? s.position + 5
                    : current?.durationSeconds ?? 0,
                );
              }
            }}
            onClick={(e) => {
              const r = (
                e.currentTarget as HTMLDivElement
              ).getBoundingClientRect();
              const pct = (e.clientX - r.left) / r.width;
              const dur =
                (current?.durationSeconds ?? Math.max(s.buffered, s.position)) || 0;
              s.seek(pct * dur);
            }}
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${bufferedPct * 100}%`,
                background: '#1f2937',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress * 100}%`,
                background: 'var(--accent)',
              }}
              aria-hidden="true"
            />
          </div>
          <span className="text-xs tabular-nums text-muted">
            {fmt(current?.durationSeconds ?? Math.max(s.buffered, s.position))}
          </span>

          <button
            className="btn"
            aria-label={s.muted || s.volume === 0 ? 'Unmute' : 'Mute'}
            onClick={() => s.setMuted(!s.muted)}
            type="button"
          >
            {s.muted || s.volume === 0 ? (
              <VolumeX size={18} aria-hidden="true" />
            ) : (
              <Volume2 size={18} aria-hidden="true" />
            )}
          </button>
          <input
            aria-label="Volume"
            className="w-28 accent-white"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={s.muted ? 0 : s.volume}
            onChange={(e) => s.setVolume(parseFloat(e.target.value))}
          />
          <button
            className={`btn ${s.shuffle ? 'ring-2 ring-accent' : ''}`}
            aria-pressed={s.shuffle}
            aria-label="Shuffle"
            onClick={() => s.setShuffle(!s.shuffle)}
            type="button"
          >
            <Shuffle size={18} aria-hidden="true" />
          </button>
          <button
            className={`btn ${s.repeat !== 'off' ? 'ring-2 ring-accent' : ''}`}
            aria-label={repeatLabel}
            aria-pressed={s.repeat !== 'off'}
            onClick={s.cycleRepeat}
            type="button"
          >
            <Repeat size={18} aria-hidden="true" />
            {s.repeat === 'one' && (
              <span className="sr-only">Repeat one</span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

