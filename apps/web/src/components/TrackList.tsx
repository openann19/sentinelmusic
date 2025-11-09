'use client';

import { usePlayer } from './player/usePlayer';
import { TrackItem } from './player/types';
import { useCrate } from './Crate';
import BuyMenu from './BuyMenu';
import { useToast } from './ui/Toast';

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

interface TrackListProps {
  releases: Release[];
  artistName: string;
}

export default function TrackList({ releases, artistName }: TrackListProps) {
  const setQueue = usePlayer((state) => state.setQueue);
  const { add: addToCrate } = useCrate();
  const { push } = useToast();

  const handlePreview = (release: Release, track: Track) => {
    const allTracks: TrackItem[] = releases.flatMap((r) =>
      r.tracks.map((t) => ({
        id: Number(t.id),
        title: t.title,
        artistName,
        coverUrl: r.coverUrl ?? null,
        durationSeconds: t.durationSeconds ?? null,
        previewUrl:
          t.links.find((l) => l.previewUrl)?.previewUrl ?? null,
        links: t.links.map((l) => ({
          id: Number(l.id),
          source: l.source.name,
          url: l.url,
          previewUrl: l.previewUrl ?? null,
        })),
      })),
    );
    const idx = allTracks.findIndex((x) => x.id === Number(track.id));
    setQueue(allTracks, idx >= 0 ? idx : 0);
  };

  const handleAddToCrate = (track: Track) => {
    addToCrate({
      title: track.title,
      artist: artistName,
      bpm: track.bpm,
      key: track.keyText,
      url: track.links[0]?.url ?? null,
    });
    push({
      title: 'Added to crate',
      description: `${track.title} by ${artistName}`,
      status: 'success',
    });
  };

  return (
    <>
      {releases.map((release) => (
        <article
          key={release.id}
          className="card overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold">
              {release.title}
              {release.year && (
                <span className="text-muted font-normal ml-2">
                  ({release.year})
                </span>
              )}
            </h2>
          </div>
          <ul role="list">
            {release.tracks.map((track) => {
              const hasPreview = track.links.some((l) => !!l.previewUrl);
              return (
                <li
                  key={track.id}
                  className="p-4 flex items-center justify-between border-b border-border last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{track.title}</div>
                    <div className="text-sm text-muted">
                      BPM {track.bpm ?? '—'} • Key {track.keyText ?? '—'}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-4">
                    <button
                      type="button"
                      disabled={!hasPreview}
                      aria-disabled={!hasPreview}
                      title={
                        hasPreview
                          ? 'Preview track'
                          : 'Preview unavailable'
                      }
                      onClick={() => handlePreview(release, track)}
                      className="btn text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={
                        hasPreview
                          ? `Preview ${track.title}`
                          : `Preview unavailable for ${track.title}`
                      }
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddToCrate(track)}
                      className="btn text-sm"
                      aria-label={`Add ${track.title} to crate`}
                    >
                      Add to crate
                    </button>
                    <BuyMenu links={track.links} trackId={track.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </>
  );
}

