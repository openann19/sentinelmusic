import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';
import { usePlayer } from '../components/player/usePlayer';
import { useToast } from '../components/ui/Toast';
import { useAnalytics } from '../hooks/useAnalytics';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('../components/player/usePlayer');
jest.mock('../components/ui/Toast');
jest.mock('../hooks/useAnalytics');

const mockSetQueue = jest.fn();
const mockPush = jest.fn();
const mockTrack = jest.fn();

(usePlayer as jest.Mock).mockReturnValue({
  setQueue: mockSetQueue,
});
(usePlayer.getState as jest.Mock) = jest.fn(() => ({
  setQueue: mockSetQueue,
}));

(useToast as jest.Mock).mockReturnValue({
  push: mockPush,
});

(useAnalytics as jest.Mock).mockReturnValue({
  track: mockTrack,
});

global.fetch = jest.fn();

describe('Home page - Search keyboard navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        artists: [],
        tracks: [
          {
            id: '1',
            title: 'Test Track',
            release: { artist: { name: 'Test Artist' } },
            links: [{ id: '1', url: 'https://example.com', previewUrl: 'https://preview.com', source: { name: 'Test' } }],
          },
        ],
      }),
    });
  });

  it('should handle arrow key navigation', async () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Artist or track');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      const trackItems = screen.getAllByRole('option');
      expect(trackItems.length).toBeGreaterThan(0);
    });

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    await waitFor(() => {
      const selected = screen.getByRole('option', { selected: true });
      expect(selected).toBeInTheDocument();
    });
  });

  it('should trigger preview on Enter key', async () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Artist or track');
    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      const trackItems = screen.getAllByRole('option');
      expect(trackItems.length).toBeGreaterThan(0);
    });

    fireEvent.keyDown(window, { key: 'ArrowDown' });
    fireEvent.keyDown(window, { key: 'Enter' });

    await waitFor(() => {
      expect(mockSetQueue).toHaveBeenCalled();
    });
  });
});

