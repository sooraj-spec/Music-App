import { toSeconds } from "../lib/format";
import type { QueueItem, RepeatMode, Track } from "../types";
import { makeItems, shuffleKeepingFirst } from "./queue";

export interface PlayerCoreState {
  queue: readonly QueueItem[];
  /** Unshuffled order, used to restore the queue when shuffle turns off. */
  baseQueue: readonly QueueItem[];
  index: number;
  isPlaying: boolean;
  positionSec: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  likedIds: ReadonlySet<string>;
  error: string | null;
  nextId: number;
  /** Bumped whenever the engine must (re)load the current track. */
  loadNonce: number;
  /** Bumped whenever the engine must seek to `seekTo`. */
  seekNonce: number;
  seekTo: number;
}

export type PlayerAction =
  | { type: "PLAY_TRACK"; track: Track; library: readonly Track[]; seed: number }
  | { type: "TOGGLE_PLAY" }
  | { type: "NEXT" }
  | { type: "PREV" }
  | { type: "ENDED"; trackId: string }
  | { type: "SEEK"; seconds: number }
  | { type: "TICK"; seconds: number; trackId: string }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_SHUFFLE"; seed: number }
  | { type: "SET_REPEAT"; mode: RepeatMode }
  | { type: "PLAY_INDEX"; index: number }
  | { type: "REMOVE"; index: number }
  | { type: "CLEAR" }
  | { type: "TOGGLE_LIKE" }
  | { type: "ENGINE_FAILED"; message: string };

export function createInitialState(library: readonly Track[]): PlayerCoreState {
  const items = makeItems(library, 1);
  return {
    queue: items,
    baseQueue: items,
    index: items.length > 0 ? 0 : -1,
    isPlaying: false,
    positionSec: 0,
    volume: 0.7,
    muted: false,
    shuffle: false,
    repeat: "off",
    likedIds: new Set(),
    error: null,
    nextId: items.length + 1,
    loadNonce: 0,
    seekNonce: 0,
    seekTo: 0,
  };
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

function currentOf(s: PlayerCoreState): QueueItem | undefined {
  return s.index >= 0 ? s.queue[s.index] : undefined;
}

function durationOf(s: PlayerCoreState): number {
  const current = currentOf(s);
  return current ? toSeconds(current.track.duration) : 0;
}

/** Ask the engine to (re)load the current track from the start. */
function load(s: PlayerCoreState, patch: Partial<PlayerCoreState>): PlayerCoreState {
  return { ...s, ...patch, positionSec: 0, error: null, loadNonce: s.loadNonce + 1 };
}

/** Ask the engine to seek back to the start without reloading. */
function rewind(s: PlayerCoreState): PlayerCoreState {
  return { ...s, positionSec: 0, seekTo: 0, seekNonce: s.seekNonce + 1 };
}

/** Move to the next item. Used by Next and by a track ending naturally. */
function advance(s: PlayerCoreState): PlayerCoreState {
  if (s.index < 0) return s;
  if (s.index + 1 < s.queue.length) return load(s, { index: s.index + 1 });
  if (s.repeat === "all") return load(s, { index: 0 });
  // End of the queue: stop on the last track, ready to play again from the start.
  return { ...rewind(s), isPlaying: false };
}

export function reducer(s: PlayerCoreState, action: PlayerAction): PlayerCoreState {
  switch (action.type) {
    case "PLAY_TRACK": {
      let nextId = s.nextId;
      let items = makeItems(action.library, nextId);
      nextId += items.length;
      let at = items.findIndex((i) => i.track.id === action.track.id);
      if (at < 0) {
        // Track is not in the library: queue it first, then the library.
        items = [...makeItems([action.track], nextId), ...items];
        nextId += 1;
        at = 0;
      }
      const queue = s.shuffle ? shuffleKeepingFirst(items, items[at], action.seed) : items;
      return load(s, {
        queue,
        baseQueue: items,
        index: s.shuffle ? 0 : at,
        nextId,
        isPlaying: true,
      });
    }

    case "TOGGLE_PLAY": {
      if (!currentOf(s)) return s;
      const toggled = { ...s, isPlaying: !s.isPlaying };
      // After an engine error, reload the track before trying again.
      return s.error ? load(toggled, {}) : toggled;
    }

    case "NEXT":
      return advance(s);

    case "PREV": {
      if (s.index < 0) return s;
      if (s.positionSec > 3) return rewind(s);
      if (s.index > 0) return load(s, { index: s.index - 1 });
      if (s.repeat === "all") return load(s, { index: s.queue.length - 1 });
      return rewind(s);
    }

    case "ENDED": {
      const current = currentOf(s);
      if (!current || current.track.id !== action.trackId || !s.isPlaying) return s;
      if (s.repeat === "one") return load(s, {});
      return advance(s);
    }

    case "SEEK": {
      const duration = durationOf(s);
      if (duration <= 0 || !Number.isFinite(action.seconds)) return s;
      const to = clamp(action.seconds, 0, duration);
      return { ...s, positionSec: to, seekTo: to, seekNonce: s.seekNonce + 1 };
    }

    case "TICK": {
      const current = currentOf(s);
      if (!current || current.track.id !== action.trackId || !s.isPlaying) return s;
      return { ...s, positionSec: Math.min(action.seconds, durationOf(s)) };
    }

    case "SET_VOLUME": {
      if (!Number.isFinite(action.volume)) return s;
      const volume = clamp(action.volume, 0, 1);
      return { ...s, volume, muted: volume > 0 ? false : s.muted };
    }

    case "TOGGLE_MUTE":
      if (s.muted) return { ...s, muted: false, volume: s.volume === 0 ? 0.5 : s.volume };
      return { ...s, muted: true };

    case "TOGGLE_SHUFFLE": {
      const current = currentOf(s);
      if (!s.shuffle) {
        const queue = shuffleKeepingFirst(s.queue, current, action.seed);
        return { ...s, shuffle: true, queue, index: current ? 0 : -1 };
      }
      // Restore the original order, without bringing back removed tracks.
      const alive = new Set(s.queue.map((i) => i.queueId));
      const queue = s.baseQueue.filter((i) => alive.has(i.queueId));
      const index = current ? queue.findIndex((i) => i.queueId === current.queueId) : -1;
      return { ...s, shuffle: false, queue, index };
    }

    case "SET_REPEAT":
      return { ...s, repeat: action.mode };

    case "PLAY_INDEX": {
      const { index } = action;
      if (!Number.isInteger(index) || index < 0 || index >= s.queue.length) return s;
      return load(s, { index, isPlaying: true });
    }

    case "REMOVE": {
      const { index } = action;
      if (!Number.isInteger(index) || index < 0 || index >= s.queue.length) return s;
      const removed = s.queue[index];
      const queue = s.queue.filter((_, i) => i !== index);
      const baseQueue = s.baseQueue.filter((i) => i.queueId !== removed.queueId);
      const base = { ...s, queue, baseQueue };

      if (queue.length === 0) {
        return load(base, { index: -1, isPlaying: false });
      }
      if (index < s.index) return { ...base, index: s.index - 1 };
      if (index > s.index) return base;
      // The current track was removed: the next item slides into its place and keeps playing.
      if (index < queue.length) return load(base, {});
      // It was the last track: pause on the new last one.
      return load(base, { index: queue.length - 1, isPlaying: false });
    }

    case "CLEAR": {
      const current = currentOf(s);
      if (!current) return { ...s, queue: [], baseQueue: [], index: -1 };
      return { ...s, queue: [current], baseQueue: [current], index: 0 };
    }

    case "TOGGLE_LIKE": {
      const current = currentOf(s);
      if (!current) return s;
      const likedIds = new Set(s.likedIds);
      if (likedIds.has(current.track.id)) likedIds.delete(current.track.id);
      else likedIds.add(current.track.id);
      return { ...s, likedIds };
    }

    case "ENGINE_FAILED":
      return { ...s, isPlaying: false, error: action.message };

    default:
      return s;
  }
}