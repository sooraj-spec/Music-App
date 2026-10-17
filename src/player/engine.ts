import type { Track } from "../types";

export type EngineEvent =
  | { type: "position"; seconds: number; trackId: string }
  | { type: "ended"; trackId: string }
  | { type: "error"; message: string };

/**
 * Contract for anything that can play a track (mock now; desktop or Android audio later).
 * - load() leaves the engine paused at 0:00.
 * - play() and pause() are idempotent.
 * - Events carry the track id so stale events can be ignored.
 * Must not import Tauri or any platform-specific module.
 */
export interface PlayerEngine {
  load(track: Track): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seek(seconds: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  subscribe(listener: (event: EngineEvent) => void): () => void;
  dispose(): Promise<void>;
}