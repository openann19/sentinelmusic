'use client';

import { TrackFilters } from './TrackFilters';
import TrackList from './TrackList';

interface Release {
  id: string;
  title: string;
  year?: number;
  coverUrl?: string | null;
  tracks: Track[];
  links: Array<{
    id: string;
    url: string;
    source: {
      id: string;
      name: string;
    };
  }>;
}

interface Track {
  id: string;
  title: string;
  bpm?: number;
  keyText?: string;
  durationSeconds?: number | null;
  links: Array<{
    id: string;
    url: string;
    previewUrl?: string | null;
    source: {
      id: string;
      name: string;
    };
  }>;
}

interface ArtistTrackListProps {
  releases: Release[];
  artistName: string;
}

export default function ArtistTrackList({
  releases,
  artistName,
}: ArtistTrackListProps) {
  const allTracks = releases.flatMap((r) => r.tracks);

  return (
    <TrackFilters
      tracks={allTracks}
      render={(filteredTracks) => {
        const trackIds = new Set(filteredTracks.map((t) => t.id));
        const filteredReleases = releases.map((release) => ({
          ...release,
          tracks: release.tracks.filter((t) => trackIds.has(t.id)),
        })).filter((release) => release.tracks.length > 0);

        return <TrackList releases={filteredReleases} artistName={artistName} />;
      }}
    />
  );
}

