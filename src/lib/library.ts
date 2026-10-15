import { PLAYLISTS, TRACKS, findTrack } from "../data/mock";
import type { ArtVariant, Collection, Track } from "../types";

export interface Album {
  id: string;
  title: string;
  artist: string;
  hue: number;
  art: ArtVariant;
  tracks: Track[];
}

export interface Artist {
  id: string;
  name: string;
  hue: number;
  art: ArtVariant;
  tracks: Track[];
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Albums and artists are derived from TRACKS, so the mock data stays in one place.
function buildAlbums(): Album[] {
  const map = new Map<string, Album>();
  for (const t of TRACKS) {
    const id = `${slug(t.album)}--${slug(t.artist)}`;
    const existing = map.get(id);
    if (existing) existing.tracks.push(t);
    else map.set(id, { id, title: t.album, artist: t.artist, hue: t.hue, art: t.art, tracks: [t] });
  }
  return [...map.values()];
}

function buildArtists(): Artist[] {
  const map = new Map<string, Artist>();
  for (const t of TRACKS) {
    const existing = map.get(t.artist);
    if (existing) existing.tracks.push(t);
    else map.set(t.artist, { id: slug(t.artist), name: t.artist, hue: t.hue, art: t.art, tracks: [t] });
  }
  return [...map.values()];
}

export const ALBUMS: Album[] = buildAlbums();
export const ARTISTS: Artist[] = buildArtists();

/** The track a playlist plays first. */
export function leadOf(collection: Collection): Track | undefined {
  return findTrack(collection.leadTrackId);
}

export interface SearchResults {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Collection[];
}

const has = (q: string, ...fields: string[]) => fields.some((f) => f.toLowerCase().includes(q));

/** Local filtering of the mock collection. */
export function searchLibrary(query: string): SearchResults {
  const q = query.trim().toLowerCase();
  if (!q) return { tracks: [], artists: [], albums: [], playlists: [] };
  return {
    tracks: TRACKS.filter((t) => has(q, t.title, t.artist, t.album)),
    artists: ARTISTS.filter((a) => has(q, a.name)),
    albums: ALBUMS.filter((a) => has(q, a.title, a.artist)),
    playlists: PLAYLISTS.filter((p) => has(q, p.title)),
  };
}