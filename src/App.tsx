import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Ambient } from "./components/Ambient";
import { Sidebar } from "./components/Sidebar";
import { MiniPlayer } from "./components/MiniPlayer";
import { NowPlaying } from "./components/NowPlaying";
import { ComingSoon } from "./components/ComingSoon";
import { FolderIcon, SearchIcon } from "./components/Icons";
import { Home } from "./screens/Home";
import { TRACKS, findTrack } from "./data/mock";
import { EASE } from "./lib/motion";
import type { PlayerApi, Screen, Track } from "./types";

/** Random play order with `first` (the current track) kept at the front. */
function shuffled(list: Track[], first: Track | null): Track[] {
  const rest = list.filter((t) => t.id !== first?.id);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first ? [first, ...rest] : rest;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // MOCK player state: UI only, no audio.
  const [track, setTrack] = useState<Track | null>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  /** Play order. Normal order, or a shuffled copy while shuffle is on. */
  const [order, setOrder] = useState<Track[]>(TRACKS);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  const index = track ? order.findIndex((t) => t.id === track.id) : -1;
  const upcoming =
    index < 0
      ? []
      : repeat
        ? [...order.slice(index + 1), ...order.slice(0, index)]
        : order.slice(index + 1);

  /** Switch track without changing the play/pause state. */
  const goTo = (i: number) => {
    setTrack(order[i]);
    setProgress(0);
  };

  const player: PlayerApi = {
    track,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    liked: track ? likedIds.has(track.id) : false,
    upcoming,

    playTrack: (t) => {
      setTrack(t);
      setProgress(0);
      setIsPlaying(true);
    },
    togglePlay: () => setIsPlaying((p) => !p),
    prev: () => {
      if (index < 0) return;
      if (progress > 0.05) return setProgress(0); // restart first
      if (index > 0) return goTo(index - 1);
      if (repeat) return goTo(order.length - 1);
      setProgress(0);
    },
    next: () => {
      if (index < 0) return;
      if (index + 1 < order.length) return goTo(index + 1);
      if (repeat) return goTo(0);
      setIsPlaying(false);
      setProgress(0);
    },
    seek: setProgress,
    setVolume,
    toggleShuffle: () => {
      const on = !shuffle;
      setShuffle(on);
      setOrder(on ? shuffled(TRACKS, track) : TRACKS);
    },
    toggleRepeat: () => setRepeat((r) => !r),
    toggleLike: () => {
      if (!track) return;
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (next.has(track.id)) next.delete(track.id);
        else next.add(track.id);
        return next;
      });
    },
  };

  const playById = (id: string) => {
    const t = findTrack(id);
    if (t) player.playTrack(t);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-full overflow-hidden bg-void">
        <Ambient hue={track?.hue ?? 265} />

        {/* Main app. Inert while Now Playing is open so focus stays in the overlay. */}
        <div className="relative z-10 flex h-full gap-3 p-3" inert={nowPlayingOpen}>
          <Sidebar current={screen} onNavigate={setScreen} onSelectPlaylist={playById} />

          <div className="relative min-w-0 flex-1">
            <main ref={mainRef} className="h-full overflow-y-auto overflow-x-hidden rounded-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={screen}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  {screen === "home" && (
                    <Home currentTrackId={track?.id} onPlayTrack={player.playTrack} />
                  )}
                  {screen === "search" && (
                    <ComingSoon title="Search" icon={<SearchIcon className="h-5 w-5" />} />
                  )}
                  {screen === "library" && (
                    <ComingSoon title="Library" icon={<FolderIcon className="h-5 w-5" />} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            <div className="pointer-events-none absolute inset-x-6 bottom-5 z-20 flex justify-center">
              <div className="pointer-events-auto w-full max-w-[780px]">
                <MiniPlayer
                  player={player}
                  expanded={nowPlayingOpen}
                  onOpen={() => setNowPlayingOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {nowPlayingOpen && track && (
            <NowPlaying key="now-playing" player={player} onClose={() => setNowPlayingOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}