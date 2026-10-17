export type Screen = "home" | "search" | "library";

/** Procedural placeholder cover styles. */
export type ArtVariant = "orb" | "horizon" | "rings" | "prism";

/** Where a track's audio comes from. Tracks without a source are sample tracks (simulated). */
export type TrackSource = { kind: "local-file"; path: string };

/** Display metadata plus an optional audio source. How it is played belongs to the engine. */
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  /** Hue (0-360) driving the cover art and the ambient background. */
  hue: number;
  art: ArtVariant;
  /** Display duration, "m:ss". */
  duration: string;
  source?: TrackSource;
}

/** A playlist, album or similar group that starts at one track. */
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

export type RepeatMode = "off" | "all" | "one";

export interface QueueItem {
  /** Unique per queue entry, so the same track can appear twice. */
  queueId: string;
  track: Track;
}

/** What the UI reads. The playback position is separate (usePlaybackPosition). */
export interface PlayerState {
  /** Play order. Already shuffled while shuffle is on. */
  queue: readonly QueueItem[];
  /** Index of the current item in `queue`, or -1 when nothing is loaded. */
  index: number;
  track: Track | null;
  isPlaying: boolean;
  durationSec: number;
  /** 0 to 1 */
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  /** Whether the current track is liked. */
  liked: boolean;
  error: string | null;
}

export interface PlayerActions {
  /** Starts a fresh queue from the library at this track. */
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  /** Jumps to an item in the current queue. */
  playQueueItem: (index: number) => void;
  removeFromQueue: (index: number) => void;
  /** Removes everything except the current track. */
  clearQueue: () => void;
  toggleLike: () => void;
}