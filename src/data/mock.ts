import type { Collection, FeaturedMix, Track } from "../types";

// MOCK DATA: fictional artists and titles for development only.
export const TRACKS: Track[] = [
  { id: "t1", title: "Afterglow Theory", artist: "Mina Sato", album: "Soft Machines", hue: 285, art: "horizon", duration: "4:12" },
  { id: "t2", title: "Glass Hours", artist: "Noor & The Tide", album: "Low Tide Letters", hue: 215, art: "rings", duration: "3:48" },
  { id: "t3", title: "Paper Satellites", artist: "Kestrel Moon", album: "Orbit Sketches", hue: 330, art: "prism", duration: "3:21" },
  { id: "t4", title: "Slow Burn Season", artist: "Ivo Hart", album: "Ember", hue: 18, art: "horizon", duration: "5:03" },
  { id: "t5", title: "Velvet Frequency", artist: "Aria Vale", album: "Night Drive", hue: 262, art: "orb", duration: "3:34" },
  { id: "t6", title: "Harbor Lights", artist: "Dune Choir", album: "Salt & Static", hue: 190, art: "rings", duration: "4:40" },
  { id: "t7", title: "Quiet Engines", artist: "Kestrel Moon", album: "Orbit Sketches", hue: 150, art: "prism", duration: "4:27" },
  { id: "t8", title: "Lowlight", artist: "Ivo Hart", album: "Ember", hue: 35, art: "orb", duration: "3:47" },
  { id: "t9", title: "Northern Wire", artist: "Dune Choir", album: "Salt & Static", hue: 230, art: "horizon", duration: "5:15" },
  { id: "t10", title: "Midnight Static", artist: "Aria Vale", album: "Night Drive", hue: 275, art: "rings", duration: "3:58" },
];

export function findTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export const FEATURED: FeaturedMix = {
  eyebrow: "Featured mix",
  title: "Afterglow",
  description: "Dreamy electronics, soft edges and the long way home.",
  meta: "32 tracks · 1 hr 48 min",
  hue: 285,
  art: "horizon",
  leadTrackId: "t1",
};

// The first item is shown large. Set this to [] to preview the empty state.
export const RECENT: Track[] = ["t5", "t2", "t3", "t8", "t6"]
  .map((id) => findTrack(id))
  .filter((t): t is Track => Boolean(t));

export const DISCOVER: Collection[] = [
  { id: "d1", title: "Night Drive", subtitle: "Album · Aria Vale", hue: 262, art: "orb", leadTrackId: "t5" },
  { id: "d2", title: "Soft Machines", subtitle: "Album · Mina Sato", hue: 285, art: "horizon", leadTrackId: "t1" },
  { id: "d3", title: "Orbit Sketches", subtitle: "Album · Kestrel Moon", hue: 330, art: "prism", leadTrackId: "t3" },
  { id: "d4", title: "Salt & Static", subtitle: "Album · Dune Choir", hue: 190, art: "rings", leadTrackId: "t6" },
];

export const PLAYLISTS: Collection[] = [
  { id: "p1", title: "Late night focus", subtitle: "32 tracks", hue: 268, art: "orb", leadTrackId: "t10" },
  { id: "p2", title: "Soft hours", subtitle: "28 tracks", hue: 340, art: "horizon", leadTrackId: "t1" },
  { id: "p3", title: "Indie discoveries", subtitle: "41 tracks", hue: 150, art: "prism", leadTrackId: "t7" },
  { id: "p4", title: "Deep focus", subtitle: "56 tracks", hue: 215, art: "rings", leadTrackId: "t2" },
];