'use client';

import { useEffect, useRef } from 'react';
import { usePlayer } from './usePlayer';
import { TrackItem } from './types';

function pickPreview(t: TrackItem): string | null {
  if (t.previewUrl) return t.previewUrl;
  const candidate = t.links?.find((l) => l.previewUrl)?.previewUrl;
  return candidate ?? null;
}

export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { queue, index, playing, volume, muted, position, onTick, next } =
    usePlayer();

  // ensure audio element exists
  useEffect(() => {
    if (!audioRef.current) {
      const a = document.createElement('audio');
      a.preload = 'metadata';
      a.crossOrigin = 'anonymous';
      audioRef.current = a;
    }
  }, []);

  // load track
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const track = queue[index];
    if (!track) return;

    const src = pickPreview(track);
    if (!src) {
      // no preview available: skip auto play and rely on link-out
      a.removeAttribute('src');
      a.load();
      return;
    }
    if (a.src !== src) {
      a.src = src;
      a.load();
    }
  }, [queue, index]);

  // playback controls
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = muted;
    a.volume = volume;
    if (
      !Number.isNaN(position) &&
      Math.abs(a.currentTime - position) > 0.5
    ) {
      a.currentTime = position;
    }

    let raf = 0;
    const tick = () => {
      const buf =
        a.buffered.length > 0
          ? a.buffered.end(a.buffered.length - 1)
          : 0;
      onTick(a.currentTime || 0, buf || 0);
      raf = requestAnimationFrame(tick);
    };
    tick();

    if (playing && a.src) {
      a.play().catch(() => {
        // autoplay may fail; user will press play
      });
    }
    if (!playing) {
      a.pause();
    }

    const end = () => next();
    a.addEventListener('ended', end);
    return () => {
      a.removeEventListener('ended', end);
      cancelAnimationFrame(raf);
    };
  }, [playing, volume, muted, position, onTick, next]);

  // Media Session
  useEffect(() => {
    const track = queue[index];
    if (!('mediaSession' in navigator) || !track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artistName,
      album: ' ',
      artwork: track.coverUrl
        ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/png' }]
        : [],
    });

    navigator.mediaSession.setActionHandler?.('play', () =>
      usePlayer.getState().play(),
    );
    navigator.mediaSession.setActionHandler?.('pause', () =>
      usePlayer.getState().pause(),
    );
    navigator.mediaSession.setActionHandler?.('previoustrack', () =>
      usePlayer.getState().prev(),
    );
    navigator.mediaSession.setActionHandler?.('nexttrack', () =>
      usePlayer.getState().next(),
    );
    navigator.mediaSession.setActionHandler?.('seekforward', () =>
      usePlayer.getState().seek(usePlayer.getState().position + 10),
    );
    navigator.mediaSession.setActionHandler?.('seekbackward', () =>
      usePlayer.getState().seek(
        Math.max(0, usePlayer.getState().position - 10),
      ),
    );
  }, [queue, index]);

  return null;
}

