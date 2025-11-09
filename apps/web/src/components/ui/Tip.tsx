'use client';

import * as Tooltip from '@radix-ui/react-tooltip';

export default function Tip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={8}
            className="rounded-xl bg-surface2 text-text border border-border px-2 py-1 text-xs shadow-lg z-[70]"
          >
            {label}
            <Tooltip.Arrow className="fill-surface2" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

