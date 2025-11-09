import type { Metadata } from 'next';
import ArtistTrackList from '../../../components/ArtistTrackList';
import PageFade from '../../../components/PageFade';

interface Artist {
  id: string;
  name: string;
  releases: Release[];
}

interface Release {
  id: string;
  title: string;
  year?: number;
  coverUrl?: string | null;
  tracks: Track[];
  links: ReleaseLink[];
}

interface Track {
  id: string;
  title: string;
  bpm?: number;
  keyText?: string;
  durationSeconds?: number | null;
  links: TrackLink[];
}

interface TrackLink {
  id: string;
  url: string;
  previewUrl?: string | null;
  source: {
    id: string;
    name: string;
  };
}

interface ReleaseLink {
  id: string;
  url: string;
  source: {
    id: string;
    name: string;
  };
}

async function getArtist(id: string): Promise<Artist | { error: string }> {
  const apiBase = process.env.API_BASE || 'http://localhost:4000';
  try {
    const res = await fetch(`${apiBase}/api/v1/artists/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return { error: 'Failed to load artist' };
    }
    return await res.json();
  } catch (error) {
    return { error: 'Failed to load artist' };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const artist = await getArtist(params.id);

  if ('error' in artist) {
    return {
      title: 'Artist Not Found',
    };
  }

  const firstRelease = artist.releases[0];
  const coverUrl = firstRelease?.coverUrl;

  return {
    title: `${artist.name} • Music Hub`,
    description: `Browse tracks and releases by ${artist.name}`,
    openGraph: {
      title: artist.name,
      description: `Browse tracks and releases by ${artist.name}`,
      type: 'profile',
      images: coverUrl ? [coverUrl] : [],
    },
    twitter: {
      card: 'summary',
      title: artist.name,
      description: `Browse tracks and releases by ${artist.name}`,
      images: coverUrl ? [coverUrl] : [],
    },
    alternates: {
      canonical: `/artist/${params.id}`,
    },
  };
}

export default async function ArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const artist = await getArtist(params.id);

  if ('error' in artist) {
    return (
      <PageFade>
        <div role="status" className="p-4">
          <p className="text-error">Artist not found.</p>
        </div>
      </PageFade>
    );
  }

  return (
    <PageFade>
      <section
        className="space-y-6"
        aria-labelledby="artist-heading"
      >
        <h1 id="artist-heading" className="text-3xl font-bold">
          {artist.name}
        </h1>
        <ArtistTrackList releases={artist.releases} artistName={artist.name} />
      </section>
    </PageFade>
  );
}

