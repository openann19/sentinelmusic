'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const AudioEngine = dynamic(() => import('@/components/player/AudioEngine'), {
  ssr: false,
});

const PlayerBar = dynamic(() => import('@/components/player/PlayerBar'), {
  ssr: false,
});

const QueueOverlay = dynamic(
  () => import('@/components/player/QueueOverlay'),
  {
    ssr: false,
  },
);

export default function PlayerRoot() {
  useEffect(() => {
    // Reserved for future hooks
  }, []);

  return (
    <>
      <AudioEngine />
      <PlayerBar />
      <QueueOverlay />
    </>
  );
}

