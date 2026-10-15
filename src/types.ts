export type Screen = "home" | "search" | "library";

/** Procedural placeholder cover styles. */
export type ArtVariant = "orb" | "horizon" | "rings" | "prism";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Hue (0-360) driving the cover art and the ambient background. */
  hue: number;
  art: ArtVariant;
  duration: string;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  hue: number;
  art: ArtVariant;
  /** Track selected in the player when this is clicked. */
  leadTrackId: string;
}

export interface FeaturedMix {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  hue: number;
  art: ArtVariant;
  leadTrackId: string;
}

/** Shared player state and actions. UI-only until the audio phase. */
export interface PlayerApi {
  track: Track | null;
  isPlaying: boolean;
  /** Seek position, 0 to 1. */
  progress: number;
  /** Volume, 0 to 1. */
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  /** Whether the current track is liked. */
  liked: boolean;
  /** Tracks after the current one, in play order. */
  upcoming: Track[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  prev: () => void;
  next: () => void;
  seek: (fraction: number) => void;
  setVolume: (fraction: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleLike: () => void;
}