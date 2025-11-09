/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlayerBar from './PlayerBar';
import AudioEngine from './AudioEngine';
import { usePlayer } from './usePlayer';
import React from 'react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      ...props
    }: React.ComponentProps<'div'> & { children?: React.ReactNode }) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => false,
}));

function Wrapper() {
  return (
    <>
      <AudioEngine />
      <PlayerBar />
    </>
  );
}

describe('PlayerBar', () => {
  beforeEach(() => {
    // Reset player state
    usePlayer.getState().setQueue([], -1);
    usePlayer.getState().pause();
    usePlayer.getState().seek(0);
    usePlayer.getState().setVolume(1);
    usePlayer.getState().setMuted(false);
    usePlayer.getState().setShuffle(false);
    while (usePlayer.getState().repeat !== 'off') {
      usePlayer.getState().cycleRepeat();
    }

    // Mock audio element
    global.HTMLAudioElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    global.HTMLAudioElement.prototype.pause = jest.fn();
    global.HTMLAudioElement.prototype.load = jest.fn();
    Object.defineProperty(global.HTMLAudioElement.prototype, 'currentTime', {
      writable: true,
      value: 0,
    });
    Object.defineProperty(global.HTMLAudioElement.prototype, 'buffered', {
      get: () => ({
        length: 1,
        end: () => 120,
      }),
    });
  });

  it('does not render when queue is empty', () => {
    const { container } = render(<Wrapper />);
    expect(container.firstChild).toBeNull();
  });

  it('renders player when queue has tracks', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    expect(screen.getByRole('group', { name: /audio player/i })).toBeInTheDocument();
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('toggles play with button', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);
    usePlayer.getState().pause();

    render(<Wrapper />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    expect(usePlayer.getState().playing).toBe(true);

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    expect(usePlayer.getState().playing).toBe(false);
  });

  it('seeks when clicking timeline', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    const slider = screen.getByRole('slider', { name: /seek/i });
    const rect = { left: 0, width: 100 };
    jest.spyOn(slider, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);

    fireEvent.click(slider, { clientX: 50 });

    // Position should be updated (50% of 120 seconds = 60 seconds)
    expect(usePlayer.getState().position).toBeGreaterThan(0);
  });

  it('handles keyboard shortcuts', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);
    usePlayer.getState().pause();

    render(<Wrapper />);

    // Space toggles play
    fireEvent.keyDown(window, { code: 'Space', preventDefault: jest.fn() });
    expect(usePlayer.getState().playing).toBe(true);

    // Arrow right seeks forward
    const positionBefore = usePlayer.getState().position;
    fireEvent.keyDown(window, { code: 'ArrowRight' });
    expect(usePlayer.getState().position).toBeGreaterThan(positionBefore);

    // Arrow left seeks backward
    usePlayer.getState().seek(10);
    fireEvent.keyDown(window, { code: 'ArrowLeft' });
    expect(usePlayer.getState().position).toBeLessThan(10);

    // Arrow up increases volume
    const volumeBefore = usePlayer.getState().volume;
    fireEvent.keyDown(window, { code: 'ArrowUp' });
    expect(usePlayer.getState().volume).toBeGreaterThan(volumeBefore);

    // Arrow down decreases volume
    fireEvent.keyDown(window, { code: 'ArrowDown' });
    expect(usePlayer.getState().volume).toBeLessThan(usePlayer.getState().volume);
  });

  it('does not trigger shortcuts when input is focused', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(
      <div>
        <input data-testid="input" />
        <Wrapper />
      </div>
    );

    const input = screen.getByTestId('input');
    input.focus();

    const playingBefore = usePlayer.getState().playing;
    fireEvent.keyDown(input, { code: 'Space' });
    // Should not toggle play when input is focused
    expect(usePlayer.getState().playing).toBe(playingBefore);
  });

  it('toggles shuffle', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    const shuffleButton = screen.getByRole('button', { name: /shuffle/i });
    expect(shuffleButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(shuffleButton);

    expect(usePlayer.getState().shuffle).toBe(true);
    expect(shuffleButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('cycles repeat mode', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    const repeatButton = screen.getByRole('button', { name: /repeat/i });
    
    expect(usePlayer.getState().repeat).toBe('off');
    expect(repeatButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(repeatButton);

    expect(usePlayer.getState().repeat).toBe('one');
    expect(repeatButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(repeatButton);

    expect(usePlayer.getState().repeat).toBe('all');
  });

  it('controls volume', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    const volumeInput = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(volumeInput, { target: { value: '0.5' } });

    expect(usePlayer.getState().volume).toBe(0.5);
  });

  it('toggles mute', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    const muteButton = screen.getByRole('button', { name: /mute|unmute/i });
    
    fireEvent.click(muteButton);

    expect(usePlayer.getState().muted).toBe(true);

    fireEvent.click(muteButton);

    expect(usePlayer.getState().muted).toBe(false);
  });

  it('navigates to next track', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Track 1',
        artistName: 'Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview1.mp3',
      },
      {
        id: 2,
        title: 'Track 2',
        artistName: 'Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview2.mp3',
      },
    ]);

    render(<Wrapper />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(usePlayer.getState().index).toBe(1);
    expect(screen.getByText('Track 2')).toBeInTheDocument();
  });

  it('navigates to previous track', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Track 1',
        artistName: 'Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview1.mp3',
      },
      {
        id: 2,
        title: 'Track 2',
        artistName: 'Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview2.mp3',
      },
    ]);
    usePlayer.getState().play(1);

    render(<Wrapper />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(usePlayer.getState().index).toBe(0);
    expect(screen.getByText('Track 1')).toBeInTheDocument();
  });

  it('displays time correctly', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);
    usePlayer.getState().seek(65);

    render(<Wrapper />);

    expect(screen.getByText('1:05')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('has accessible labels for all controls', () => {
    usePlayer.getState().setQueue([
      {
        id: 1,
        title: 'Test Track',
        artistName: 'Test Artist',
        durationSeconds: 120,
        previewUrl: 'https://example.com/preview.mp3',
      },
    ]);

    render(<Wrapper />);

    expect(screen.getByRole('group', { name: /audio player/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /seek/i })).toBeInTheDocument();
    expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /shuffle/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /repeat/i })).toBeInTheDocument();
  });
});

