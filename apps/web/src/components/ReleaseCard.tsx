import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ReleaseCardProps {
  release: {
    id: string;
    title: string;
    coverUrl?: string | null;
    artist: {
      id: string;
      name: string;
    };
  };
}

export function ReleaseCard({ release }: ReleaseCardProps) {
  return (
    <motion.article
      className="card overflow-hidden"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex gap-4 p-4">
        <div className="relative h-24 w-24 flex-none rounded-xl overflow-hidden border border-border">
          {release.coverUrl ? (
            <Image
              src={release.coverUrl}
              alt={`${release.title} cover`}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface2" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{release.title}</h3>
          <p className="text-sm text-muted truncate">{release.artist.name}</p>
          <div className="mt-3 flex gap-2">
            <Link
              href={`/artist/${release.artist.id}`}
              className="btn text-sm"
              aria-label={`View ${release.artist.name}`}
            >
              Artist
            </Link>
            <Link
              href={`/release/${release.id}`}
              className="btn btn-primary text-sm"
              aria-label={`View ${release.title}`}
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

