import { toSeconds } from "../lib/format";
import type { Track } from "../types";
import type { EngineEvent, PlayerEngine } from "./engine";

const TICK_MS = 250;

type Listener = (event: EngineEvent) => void;

/** Simulates a playback clock. It produces NO sound. */
class MockEngine implements PlayerEngine {
  private listeners = new Set<Listener>();
  private trackId: string | null = null;
  private duration = 0;
  private position = 0;
  private playing = false;
  private timer: number | null = null;
  private lastTick = 0;

  private emit(event: EngineEvent) {
    for (const listener of [...this.listeners]) listener(event);
  }

  private advance() {
    const now = performance.now();
    this.position += (now - this.lastTick) / 1000;
    this.lastTick = now;
  }

  private stopTimer() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  private onTick = () => {
    if (!this.playing || this.trackId === null) return;
    this.advance();
    if (this.position >= this.duration) {
      this.position = this.duration;
      this.playing = false;
      this.stopTimer();
      this.emit({ type: "position", seconds: this.position, trackId: this.trackId });
      this.emit({ type: "ended", trackId: this.trackId });
      return;
    }
    this.emit({ type: "position", seconds: this.position, trackId: this.trackId });
  };

  async load(track: Track) {
    this.stopTimer();
    this.playing = false;
    this.trackId = track.id;
    this.duration = toSeconds(track.duration);
    this.position = 0;
  }

  async play() {
    if (this.trackId === null || this.playing) return;
    if (this.position >= this.duration) this.position = 0;
    this.playing = true;
    this.lastTick = performance.now();
    this.timer = window.setInterval(this.onTick, TICK_MS);
  }

  async pause() {
    if (!this.playing) return;
    this.advance();
    this.playing = false;
    this.stopTimer();
  }

  async seek(seconds: number) {
    if (!Number.isFinite(seconds)) return;
    this.position = Math.min(Math.max(seconds, 0), this.duration);
    if (this.playing) this.lastTick = performance.now();
  }

  async setVolume(_volume: number) {
    // The mock has no audio output.
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async dispose() {
    this.stopTimer();
    this.playing = false;
    this.trackId = null;
    this.listeners.clear();
  }
}

export const createMockEngine = (): PlayerEngine => new MockEngine();