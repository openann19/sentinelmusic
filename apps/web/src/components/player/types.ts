export type TrackLink = {
  id: number;
  source: string;
  url: string;
  previewUrl?: string | null;
};

export type TrackItem = {
  id: number;
  title: string;
  artistName: string;
  coverUrl?: string | null;
  durationSeconds?: number | null;
  previewUrl?: string | null; // authoritative preview, if permitted
  links?: TrackLink[];
};

