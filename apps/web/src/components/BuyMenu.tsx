'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface Link {
  id: string;
  url: string;
  source: {
    name: string;
  };
}

export default function BuyMenu({
  links,
  trackId,
}: {
  links: Link[];
  trackId?: string;
}) {
  const [open, setOpen] = useState(false);
  const { track } = useAnalytics();

  if (!links || links.length === 0) {
    return (
      <button className="btn text-sm" disabled aria-disabled="true">
        Buy
      </button>
    );
  }

  if (links.length === 1) {
    return (
      <a
        href={links[0].url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn text-sm"
        aria-label={`Buy on ${links[0].source.name}`}
      >
        Buy
      </a>
    );
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="btn btn-primary text-sm" aria-haspopup="menu">
          Buy
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          className="rounded-xl bg-surface text-text border border-border p-2 shadow-lg z-[70] min-w-48"
        >
          <ul role="menu" className="space-y-1">
            {links.map((l) => (
              <li key={l.id}>
                <a
                  role="menuitem"
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded hover:bg-surface2 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-surface"
                  onClick={() => {
                    setOpen(false);
                    track({
                      type: 'buy_link_click',
                      data: {
                        track_id: trackId,
                        source: l.source.name,
                      },
                    });
                  }}
                >
                  {l.source.name}
                </a>
              </li>
            ))}
          </ul>
          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

