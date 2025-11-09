import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  artistId: z.string(),
  year: z.number().int().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TrackSchema = z.object({
  id: z.string(),
  title: z.string(),
  albumId: z.string(),
  duration: z.number().int().optional(),
  trackNumber: z.number().int().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Artist = z.infer<typeof ArtistSchema>;
export type Album = z.infer<typeof AlbumSchema>;
export type Track = z.infer<typeof TrackSchema>;


