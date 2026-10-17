import type { Track } from "../types";
import type { EngineEvent, PlayerEngine } from "./engine";
import { createMockEngine } from "./mockEngine";
import { TauriEngine } from "./tauriEngine";

type Listener = (event: EngineEvent) => void;

/**
 * Routes each track to the right engine:
 * - tracks with a local-file source play through the native audio engine
 * - sample tracks (no source) use the simulated mock engine, with no sound
 */
class DesktopEngine implements PlayerEngine {
  private readonly mock = createMockEngine();
  private readonly real = new TauriEngine();
  private active: PlayerEngine = this.mock;
  private readonly listeners = new Set<Listener>();
  private readonly offs: Array<() => void>;

  constructor() {
    const forward = (event: EngineEvent) => {
      for (const listener of [...this.listeners]) listener(event);
    };
    this.offs = [this.mock.subscribe(forward), this.real.subscribe(forward)];
  }

  async load(track: Track): Promise<void> {
    const target = track.source ? this.real : this.mock;
    if (target !== this.active) {
      const previous = this.active;
      await previous.pause();
      if (previous === this.real) await this.real.unload();
      this.active = target;
    }
    await target.load(track);
  }

  play = () => this.active.play();
  pause = () => this.active.pause();
  seek = (seconds: number) => this.active.seek(seconds);

  async setVolume(volume: number): Promise<void> {
    await Promise.all([this.mock.setVolume(volume), this.real.setVolume(volume)]);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async dispose(): Promise<void> {
    for (const off of this.offs) off();
    this.listeners.clear();
    await Promise.all([this.mock.dispose(), this.real.dispose()]);
  }
}

export const createDesktopEngine = (): PlayerEngine => new DesktopEngine();