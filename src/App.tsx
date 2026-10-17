import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Ambient } from "./components/Ambient";
import { Sidebar } from "./components/Sidebar";
import { MiniPlayer } from "./components/MiniPlayer";
import { NowPlaying } from "./components/NowPlaying";
import { Home } from "./screens/Home";
import { Search } from "./screens/Search";
import { Library } from "./screens/Library";
import { PlayerProvider, usePlayerActions, usePlayerState } from "./player/PlayerProvider";
import { mockCatalog } from "./services/catalog";
import { EASE } from "./lib/motion";
import type { Screen } from "./types";

function Shell() {
  const [screen, setScreen] = useState<Screen>("home");
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const { track } = usePlayerState();
  const { playTrack } = usePlayerActions();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  // If the queue empties while Now Playing is open, close it so it doesn't reappear later.
  useEffect(() => {
    if (!track) setNowPlayingOpen(false);
  }, [track]);

  const playById = (id: string) => {
    const t = mockCatalog.getTrack(id);
    if (t) playTrack(t);
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
                  {screen === "home" && <Home currentTrackId={track?.id} onPlayTrack={playTrack} />}
                  {screen === "search" && <Search currentTrack={track} onPlayTrack={playTrack} />}
                  {screen === "library" && <Library currentTrack={track} onPlayTrack={playTrack} />}
                </motion.div>
              </AnimatePresence>
            </main>

            <div className="pointer-events-none absolute inset-x-6 bottom-5 z-20 flex justify-center">
              <div className="pointer-events-auto w-full max-w-[780px]">
                <MiniPlayer expanded={nowPlayingOpen} onOpen={() => setNowPlayingOpen(true)} />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {nowPlayingOpen && track && (
            <NowPlaying key="now-playing" onClose={() => setNowPlayingOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <PlayerProvider catalog={mockCatalog}>
      <Shell />
    </PlayerProvider>
  );
}