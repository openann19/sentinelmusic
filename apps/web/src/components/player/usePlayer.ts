import { create } from 'zustand';
import { TrackItem } from './types';

type RepeatMode = 'off' | 'one' | 'all';

type PlayerState = {
  queue: TrackItem[];
  index: number; // -1 means empty
  playing: boolean;
  volume: number; // 0..1
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  position: number; // seconds
  buffered: number; // seconds
  setQueue: (q: TrackItem[], startIndex?: number) => void;
  play: (idx?: number) => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (sec: number) => void;
  toggle: () => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setShuffle: (s: boolean) => void;
  cycleRepeat: () => void;
  onTick: (pos: number, buf: number) => void;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  index: -1,
  playing: false,
  volume: 1,
  muted: false,
  shuffle: false,
  repeat: 'off',
  position: 0,
  buffered: 0,
  setQueue: (q, startIndex = 0) =>
    set({
      queue: q,
      index: q.length ? startIndex : -1,
      playing: q.length > 0,
      position: 0,
    }),
  play: (idx) => {
    const s = get();
    const index = typeof idx === 'number' ? idx : s.index;
    if (index < 0 || index >= s.queue.length) return;
    set({ index, playing: true });
  },
  pause: () => set({ playing: false }),
  next: () => {
    const s = get();
    if (!s.queue.length) return;

    if (s.repeat === 'one') return set({ position: 0, playing: true });

    if (s.shuffle) {
      const choices = s.queue.map((_, i) => i).filter((i) => i !== s.index);
      const index =
        choices.length > 0
          ? choices[Math.floor(Math.random() * choices.length)]
          : s.index;
      set({ index, position: 0, playing: true });
    } else {
      const last = s.index >= s.queue.length - 1;
      if (last && s.repeat !== 'all') return set({ playing: false });

      const index = last ? 0 : s.index + 1;
      set({ index, position: 0, playing: true });
    }
  },
  prev: () => {
    const s = get();
    if (!s.queue.length) return;

    if (s.position > 3) return set({ position: 0 });

    const index = s.index <= 0 ? 0 : s.index - 1;
    set({ index, position: 0, playing: true });
  },
  seek: (sec) => set({ position: Math.max(0, sec) }),
  toggle: () => set({ playing: !get().playing }),
  setVolume: (v) =>
    set({
      volume: Math.min(1, Math.max(0, v)),
      muted: v === 0 ? true : get().muted,
    }),
  setMuted: (m) => set({ muted: m }),
  setShuffle: (s) => set({ shuffle: s }),
  cycleRepeat: () => {
    const order: RepeatMode[] = ['off', 'one', 'all'];
    const s = get();
    const next = order[(order.indexOf(s.repeat) + 1) % order.length];
    set({ repeat: next });
  },
  onTick: (pos, buf) => set({ position: pos, buffered: buf }),
}));

