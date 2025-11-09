import { renderHook, act } from '@testing-library/react';
import { usePlayer } from './usePlayer';
import { TrackItem } from './types';

describe('usePlayer', () => {
  beforeEach(() => {
    // Reset store state before each test
    usePlayer.getState().setQueue([], -1);
    usePlayer.getState().pause();
    usePlayer.getState().seek(0);
    usePlayer.getState().setVolume(1);
    usePlayer.getState().setMuted(false);
    usePlayer.getState().setShuffle(false);
    usePlayer.getState().cycleRepeat();
    while (usePlayer.getState().repeat !== 'off') {
      usePlayer.getState().cycleRepeat();
    }
  });

  const mockTrack: TrackItem = {
    id: 1,
    title: 'Test Track',
    artistName: 'Test Artist',
    coverUrl: null,
    durationSeconds: 120,
    previewUrl: 'https://example.com/preview.mp3',
    links: [],
  };

  describe('setQueue', () => {
    it('should set queue and start playing', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setQueue([mockTrack], 0);
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.index).toBe(0);
      expect(result.current.playing).toBe(true);
    });

    it('should handle empty queue', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setQueue([]);
      });

      expect(result.current.queue).toHaveLength(0);
      expect(result.current.index).toBe(-1);
    });
  });

  describe('play', () => {
    it('should start playing at specified index', () => {
      const tracks = [mockTrack, { ...mockTrack, id: 2, title: 'Track 2' }];
      usePlayer.getState().setQueue(tracks, 0);

      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.play(1);
      });

      expect(result.current.index).toBe(1);
      expect(result.current.playing).toBe(true);
    });

    it('should not play if index is out of bounds', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.play(10);
      });

      expect(result.current.index).toBe(0);
    });
  });

  describe('pause', () => {
    it('should pause playback', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.pause();
      });

      expect(result.current.playing).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle play/pause', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.toggle();
      });

      expect(result.current.playing).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.playing).toBe(true);
    });
  });

  describe('next', () => {
    it('should go to next track', () => {
      const tracks = [
        mockTrack,
        { ...mockTrack, id: 2, title: 'Track 2' },
        { ...mockTrack, id: 3, title: 'Track 3' },
      ];
      usePlayer.getState().setQueue(tracks, 0);
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.next();
      });

      expect(result.current.index).toBe(1);
    });

    it('should stop at end when repeat is off', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.next();
      });

      expect(result.current.playing).toBe(false);
    });

    it('should loop when repeat is all', () => {
      const tracks = [mockTrack, { ...mockTrack, id: 2, title: 'Track 2' }];
      usePlayer.getState().setQueue(tracks, 1);
      usePlayer.getState().cycleRepeat(); // off -> one
      usePlayer.getState().cycleRepeat(); // one -> all

      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.next();
      });

      expect(result.current.index).toBe(0);
      expect(result.current.playing).toBe(true);
    });

    it('should restart current track when repeat is one', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      usePlayer.getState().seek(60);
      usePlayer.getState().cycleRepeat(); // off -> one

      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.next();
      });

      expect(result.current.position).toBe(0);
      expect(result.current.index).toBe(0);
    });

    it('should shuffle to random track', () => {
      const tracks = [
        mockTrack,
        { ...mockTrack, id: 2, title: 'Track 2' },
        { ...mockTrack, id: 3, title: 'Track 3' },
      ];
      usePlayer.getState().setQueue(tracks, 0);
      usePlayer.getState().setShuffle(true);

      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.next();
      });

      expect(result.current.index).not.toBe(0);
      expect(result.current.index).toBeGreaterThanOrEqual(0);
      expect(result.current.index).toBeLessThan(3);
    });
  });

  describe('prev', () => {
    it('should go to previous track', () => {
      const tracks = [
        mockTrack,
        { ...mockTrack, id: 2, title: 'Track 2' },
      ];
      usePlayer.getState().setQueue(tracks, 1);
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.prev();
      });

      expect(result.current.index).toBe(0);
    });

    it('should restart track if position is greater than 3 seconds', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      usePlayer.getState().seek(10);

      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.prev();
      });

      expect(result.current.position).toBe(0);
      expect(result.current.index).toBe(0);
    });

    it('should not go below index 0', () => {
      usePlayer.getState().setQueue([mockTrack], 0);
      usePlayer.getState().seek(1);

      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.prev();
      });

      expect(result.current.index).toBe(0);
    });
  });

  describe('seek', () => {
    it('should seek to specified position', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.seek(30);
      });

      expect(result.current.position).toBe(30);
    });

    it('should not seek below 0', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.seek(-10);
      });

      expect(result.current.position).toBe(0);
    });
  });

  describe('setVolume', () => {
    it('should set volume', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(result.current.volume).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setVolume(1.5);
      });

      expect(result.current.volume).toBe(1);

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(result.current.volume).toBe(0);
    });

    it('should mute when volume is set to 0', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setVolume(0);
      });

      expect(result.current.muted).toBe(true);
    });
  });

  describe('setMuted', () => {
    it('should set muted state', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setMuted(true);
      });

      expect(result.current.muted).toBe(true);
    });
  });

  describe('setShuffle', () => {
    it('should set shuffle state', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.setShuffle(true);
      });

      expect(result.current.shuffle).toBe(true);
    });
  });

  describe('cycleRepeat', () => {
    it('should cycle through repeat modes', () => {
      const { result } = renderHook(() => usePlayer());

      expect(result.current.repeat).toBe('off');

      act(() => {
        result.current.cycleRepeat();
      });

      expect(result.current.repeat).toBe('one');

      act(() => {
        result.current.cycleRepeat();
      });

      expect(result.current.repeat).toBe('all');

      act(() => {
        result.current.cycleRepeat();
      });

      expect(result.current.repeat).toBe('off');
    });
  });

  describe('onTick', () => {
    it('should update position and buffered', () => {
      const { result } = renderHook(() => usePlayer());

      act(() => {
        result.current.onTick(45, 60);
      });

      expect(result.current.position).toBe(45);
      expect(result.current.buffered).toBe(60);
    });
  });
});

