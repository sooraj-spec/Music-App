import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { call } from "../lib/tauri";
import type { Track } from "../types";
import type { EngineEvent, PlayerEngine } from "./engine";

type Listener = (event: EngineEvent) => void;

interface PositionPayload {
  trackId: string;
  generation: number;
  seconds: number;
}

interface EndedPayload {
  trackId: string;
  generation: number;
}

/** Talks to the Rust audio engine. Only plays tracks that have a local-file source. */
export class TauriEngine implements PlayerEngine {
  private listeners = new Set<Listener>();
  private unlisteners: UnlistenFn[] = [];
  private ready: Promise<void>;
  /** Events from any other generation belong to an older load and are ignored. */
  private generation = -1;
  private loadError: Error | null = null;
  private disposed = false;

  constructor() {
    this.ready = this.attach();
    this.ready.catch(() => undefined); // surfaced when load() awaits it
  }

  private async attach(): Promise<void> {
    const offPosition = await listen<PositionPayload>("audio:position", ({ payload }) => {
      if (payload.generation !== this.generation) return;
      this.emit({ type: "position", seconds: payload.seconds, trackId: payload.trackId });
    });
    const offEnded = await listen<EndedPayload>("audio:ended", ({ payload }) => {
      if (payload.generation !== this.generation) return;
      this.emit({ type: "ended", trackId: payload.trackId });
    });
    if (this.disposed) {
      offPosition();
      offEnded();
      return;
    }
    this.unlisteners = [offPosition, offEnded];
  }

  private emit(event: EngineEvent) {
    for (const listener of [...this.listeners]) listener(event);
  }

  async load(track: Track): Promise<void> {
    await this.ready;
    this.generation = -1;
    this.loadError = null;

    if (track.source?.kind !== "local-file") {
      this.loadError = new Error("This track has no audio file.");
      throw this.loadError;
    }
    try {
      this.generation = await call<number>("audio_load", {
        path: track.source.path,
        trackId: track.id,
      });
    } catch (err) {
      this.loadError = err instanceof Error ? err : new Error(String(err));
      throw this.loadError;
    }
  }

  async play(): Promise<void> {
    await this.ready;
    // Re-throw the original load error instead of a confusing "no track loaded".
    if (this.loadError) throw this.loadError;
    await call("audio_play");
  }

  async pause(): Promise<void> {
    await call("audio_pause");
  }

  async seek(seconds: number): Promise<void> {
    await call("audio_seek", { seconds });
  }

  async setVolume(volume: number): Promise<void> {
    await call("audio_set_volume", { volume });
  }

  /** Releases the loaded file. */
  async unload(): Promise<void> {
    this.generation = -1;
    await call("audio_stop");
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async dispose(): Promise<void> {
    this.disposed = true;
    for (const off of this.unlisteners) off();
    this.unlisteners = [];
    this.listeners.clear();
    await call("audio_stop").catch((err: unknown) => {
      console.error("[player] failed to stop native audio", err);
    });
  }
}