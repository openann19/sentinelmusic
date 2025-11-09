import { render, screen, fireEvent } from '@testing-library/react';
import BuyMenu from './BuyMenu';
import { useAnalytics } from '../hooks/useAnalytics';

jest.mock('../hooks/useAnalytics');
const mockTrack = jest.fn();
(useAnalytics as jest.Mock).mockReturnValue({ track: mockTrack });

describe('BuyMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render disabled button when no links', () => {
    render(<BuyMenu links={[]} />);
    const button = screen.getByRole('button', { name: /buy/i });
    expect(button).toBeDisabled();
  });

  it('should render single link as direct link', () => {
    const links = [
      {
        id: '1',
        url: 'https://example.com',
        source: { name: 'Example' },
      },
    ];
    render(<BuyMenu links={links} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render popover with menu items for multiple links', () => {
    const links = [
      {
        id: '1',
        url: 'https://example1.com',
        source: { name: 'Source 1' },
      },
      {
        id: '2',
        url: 'https://example2.com',
        source: { name: 'Source 2' },
      },
    ];
    render(<BuyMenu links={links} trackId="123" />);
    const trigger = screen.getByRole('button', { name: /buy/i });
    fireEvent.click(trigger);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(2);
    expect(menuItems[0]).toHaveTextContent('Source 1');
    expect(menuItems[1]).toHaveTextContent('Source 2');
  });

  it('should track analytics on link click', () => {
    const links = [
      {
        id: '1',
        url: 'https://example.com',
        source: { name: 'Example' },
      },
    ];
    render(<BuyMenu links={links} trackId="123" />);
    const trigger = screen.getByRole('button', { name: /buy/i });
    fireEvent.click(trigger);

    const menuItem = screen.getByRole('menuitem');
    fireEvent.click(menuItem);

    expect(mockTrack).toHaveBeenCalledWith({
      type: 'buy_link_click',
      data: {
        track_id: '123',
        source: 'Example',
      },
    });
  });
});

