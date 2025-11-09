import { motion } from 'framer-motion';

interface TrackCardProps {
  track: {
    id: string;
    title: string;
    artistName: string;
    coverUrl?: string | null;
    durationSeconds?: number | null;
    hasPreview: boolean;
    links: Array<{
      id: string;
      url: string;
      source: string;
    }>;
  };
  onPreview?: () => void;
}

export function TrackCard({ track, onPreview }: TrackCardProps) {
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.article
      className="card p-4"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{track.title}</h3>
          <p className="text-sm text-muted truncate">{track.artistName}</p>
          {track.durationSeconds && (
            <p className="text-xs text-muted mt-1">
              {formatDuration(track.durationSeconds)}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {onPreview && (
            <button
              type="button"
              disabled={!track.hasPreview}
              aria-disabled={!track.hasPreview}
              title={
                track.hasPreview
                  ? 'Preview track'
                  : 'Preview unavailable'
              }
              onClick={onPreview}
              className="btn text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={
                track.hasPreview
                  ? `Preview ${track.title}`
                  : `Preview unavailable for ${track.title}`
              }
            >
              Preview
            </button>
          )}
          {track.links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn text-sm"
              aria-label={`Buy ${track.title} on ${link.source}`}
            >
              {link.source}
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

