import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { toSeconds } from "../lib/format";
import type { PlayerActions, PlayerState } from "../types";
import type { TrackCatalog } from "../services/catalog";
import type { PlayerEngine } from "./engine";
import { createMockEngine } from "./mockEngine";
import { createInitialState, reducer } from "./reducer";

const StateContext = createContext<PlayerState | null>(null);
const ActionsContext = createContext<PlayerActions | null>(null);
const PositionContext = createContext<number | null>(null);

function required<T>(value: T | null, hook: string): T {
  if (value === null) throw new Error(`${hook} must be used inside <PlayerProvider>`);
  return value;
}

/** Everything except the playback position. Does not change on every clock tick. */
export const usePlayerState = () => required(useContext(StateContext), "usePlayerState");
/** Stable action functions. */
export const usePlayerActions = () => required(useContext(ActionsContext), "usePlayerActions");
/** Playback position in seconds. Changes about four times a second while playing. */
export const usePlaybackPosition = () =>
  required(useContext(PositionContext), "usePlaybackPosition");

const newSeed = () => Math.floor(Math.random() * 0x100000000);

interface PlayerProviderProps {
  catalog: TrackCatalog;
  /** Keep this function stable (declare it outside components). */
  createEngine?: () => PlayerEngine;
  children: ReactNode;
}

export function PlayerProvider({
  catalog,
  createEngine = createMockEngine,
  children,
}: PlayerProviderProps) {
  const library = useMemo(() => catalog.listTracks(), [catalog]);
  const [state, dispatch] = useReducer(reducer, library, createInitialState);

  const engineRef = useRef<PlayerEngine | null>(null);
  const chainRef = useRef<Promise<void>>(Promise.resolve());

  /** Engine commands run one at a time, in order. Failures pause playback and are logged. */
  const run = useCallback((task: (engine: PlayerEngine) => Promise<void>) => {
    chainRef.current = chainRef.current
      .then(() => {
        const engine = engineRef.current;
        return engine ? task(engine) : undefined;
      })
      .catch((err: unknown) => {
        console.error("[player] engine error", err);
        dispatch({
          type: "ENGINE_FAILED",
          message: err instanceof Error ? err.message : "Playback engine error",
        });
      });
  }, []);

  // Create the engine and listen to its events.
  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;
    const unsubscribe = engine.subscribe((event) => {
      if (event.type === "position") {
        dispatch({ type: "TICK", seconds: event.seconds, trackId: event.trackId });
      } else if (event.type === "ended") {
        dispatch({ type: "ENDED", trackId: event.trackId });
      } else {
        dispatch({ type: "ENGINE_FAILED", message: event.message });
      }
    });
    return () => {
      unsubscribe();
      engineRef.current = null;
      void engine.dispose();
    };
  }, [createEngine]);

  const track = state.index >= 0 ? (state.queue[state.index]?.track ?? null) : null;

  // Keep the engine in step with the state (effects run in this order).
  useEffect(() => {
    if (!track) {
      run((engine) => engine.pause());
      return;
    }
    run((engine) => engine.load(track));
  }, [track, state.loadNonce, run]);

  useEffect(() => {
    const shouldPlay = state.isPlaying && track !== null;
    run((engine) => (shouldPlay ? engine.play() : engine.pause()));
  }, [state.isPlaying, track, state.loadNonce, run]);

  useEffect(() => {
    const volume = state.muted ? 0 : state.volume;
    run((engine) => engine.setVolume(volume));
  }, [state.muted, state.volume, run]);

  useEffect(() => {
    if (state.seekNonce === 0) return;
    const to = state.seekTo;
    run((engine) => engine.seek(to));
  }, [state.seekNonce, state.seekTo, run]);

  const core = useMemo<PlayerState>(
    () => ({
      queue: state.queue,
      index: state.index,
      track,
      isPlaying: state.isPlaying,
      durationSec: track ? toSeconds(track.duration) : 0,
      volume: state.volume,
      muted: state.muted,
      shuffle: state.shuffle,
      repeat: state.repeat,
      liked: track ? state.likedIds.has(track.id) : false,
      error: state.error,
    }),
    [
      state.queue,
      state.index,
      track,
      state.isPlaying,
      state.volume,
      state.muted,
      state.shuffle,
      state.repeat,
      state.likedIds,
      state.error,
    ],
  );

  const actions = useMemo<PlayerActions>(
    () => ({
      playTrack: (t) => dispatch({ type: "PLAY_TRACK", track: t, library, seed: newSeed() }),
      togglePlayPause: () => dispatch({ type: "TOGGLE_PLAY" }),
      playNext: () => dispatch({ type: "NEXT" }),
      playPrevious: () => dispatch({ type: "PREV" }),
      seek: (seconds) => dispatch({ type: "SEEK", seconds }),
      setVolume: (volume) => dispatch({ type: "SET_VOLUME", volume }),
      toggleMute: () => dispatch({ type: "TOGGLE_MUTE" }),
      toggleShuffle: () => dispatch({ type: "TOGGLE_SHUFFLE", seed: newSeed() }),
      setRepeatMode: (mode) => dispatch({ type: "SET_REPEAT", mode }),
      playQueueItem: (index) => dispatch({ type: "PLAY_INDEX", index }),
      removeFromQueue: (index) => dispatch({ type: "REMOVE", index }),
      clearQueue: () => dispatch({ type: "CLEAR" }),
      toggleLike: () => dispatch({ type: "TOGGLE_LIKE" }),
    }),
    [library],
  );

  return (
    <StateContext.Provider value={core}>
      <ActionsContext.Provider value={actions}>
        <PositionContext.Provider value={state.positionSec}>{children}</PositionContext.Provider>
      </ActionsContext.Provider>
    </StateContext.Provider>
  );
}