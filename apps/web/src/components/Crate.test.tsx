import { render, screen, fireEvent } from '@testing-library/react';
import { useCrate, CratePanel } from './Crate';
import { useAnalytics } from '../hooks/useAnalytics';

jest.mock('../hooks/useAnalytics');
const mockTrack = jest.fn();
(useAnalytics as jest.Mock).mockReturnValue({ track: mockTrack });

describe('Crate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCrate.getState().clear();
  });

  it('should add rows to crate', () => {
    const { add } = useCrate.getState();
    add({
      title: 'Test Track',
      artist: 'Test Artist',
      bpm: 128,
      key: '8A',
      url: 'https://example.com',
    });

    expect(useCrate.getState().rows).toHaveLength(1);
    expect(useCrate.getState().rows[0].title).toBe('Test Track');
  });

  it('should remove rows from crate', () => {
    const { add, remove } = useCrate.getState();
    add({ title: 'Track 1', artist: 'Artist 1' });
    add({ title: 'Track 2', artist: 'Artist 2' });

    expect(useCrate.getState().rows).toHaveLength(2);
    remove(0);
    expect(useCrate.getState().rows).toHaveLength(1);
    expect(useCrate.getState().rows[0].title).toBe('Track 2');
  });

  it('should clear crate', () => {
    const { add, clear } = useCrate.getState();
    add({ title: 'Track 1', artist: 'Artist 1' });
    add({ title: 'Track 2', artist: 'Artist 2' });

    expect(useCrate.getState().rows).toHaveLength(2);
    clear();
    expect(useCrate.getState().rows).toHaveLength(0);
  });

  it('should render crate panel with rows', () => {
    const { add } = useCrate.getState();
    add({
      title: 'Test Track',
      artist: 'Test Artist',
      bpm: 128,
      key: '8A',
      url: 'https://example.com',
    });

    render(<CratePanel />);
    expect(screen.getByText('Crate: 1')).toBeInTheDocument();
    expect(screen.getByText('Test Artist — Test Track')).toBeInTheDocument();
  });

  it('should track analytics on export', () => {
    const { add } = useCrate.getState();
    add({ title: 'Track 1', artist: 'Artist 1' });
    add({ title: 'Track 2', artist: 'Artist 2' });

    render(<CratePanel />);

    const exportButton = screen.getByLabelText('Export crate as CSV');
    fireEvent.click(exportButton);

    expect(mockTrack).toHaveBeenCalledWith({
      type: 'crate_export',
      data: { rows: 2 },
    });
  });
});

