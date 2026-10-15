import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Sidebar } from "./components/Sidebar";
import { MiniPlayer } from "./components/MiniPlayer";
import { ComingSoon } from "./components/ComingSoon";
import { FolderIcon, SearchIcon } from "./components/Icons";
import { Home } from "./screens/Home";
import { TRACKS, findTrack } from "./data/mock";
import { EASE } from "./lib/motion";
import type { Screen, Track } from "./types";

/** Soft color wash derived from the current track. Static gradients only (no animated blur). */
function Ambient({ hue }: { hue: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={hue}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(55% 48% at 20% 0%, hsl(${hue} 70% 46% / 0.26), transparent 70%), radial-gradient(48% 44% at 100% 100%, hsl(${(hue + 50) % 360} 60% 40% / 0.14), transparent 70%)`,
          }}
        />
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  // MOCK player state: UI only, no audio.
  const [track, setTrack] = useState<Track | null>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  const playTrack = (t: Track) => {
    setTrack(t);
    setIsPlaying(true);
  };

  const playById = (id: string) => {
    const t = findTrack(id);
    if (t) playTrack(t);
  };

  const step = (direction: 1 | -1) => {
    const index = TRACKS.findIndex((t) => t.id === track?.id);
    setTrack(TRACKS[(index + direction + TRACKS.length) % TRACKS.length]);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-full overflow-hidden bg-void">
        <Ambient hue={track?.hue ?? 265} />

        <div className="relative z-10 flex h-full gap-3 p-3">
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
                  {screen === "home" && <Home currentTrackId={track?.id} onPlayTrack={playTrack} />}
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
                  track={track}
                  isPlaying={isPlaying}
                  onTogglePlay={() => setIsPlaying((p) => !p)}
                  onPrev={() => step(-1)}
                  onNext={() => step(1)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}