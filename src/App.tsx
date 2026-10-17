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
import { createDesktopEngine } from "./player/desktopEngine";
import { createMockEngine } from "./player/mockEngine";
import { mockCatalog } from "./services/catalog";
import { pickLocalTrack } from "./services/localFiles";
import { isTauriRuntime } from "./lib/runtime";
import { EASE } from "./lib/motion";
import type { Screen } from "./types";

// Native audio in the Tauri window, the simulated engine in a plain browser.
const createEngine = isTauriRuntime() ? createDesktopEngine : createMockEngine;

function Shell() {
  const [screen, setScreen] = useState<Screen>("home");
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const { track, error } = usePlayerState();
  const { playTrack } = usePlayerActions();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [screen]);

  // If the queue empties while Now Playing is open, close it so it doesn't reappear later.
  useEffect(() => {
    if (!track) setNowPlayingOpen(false);
  }, [track]);

  // Surface engine errors even when Now Playing is closed.
  useEffect(() => {
    if (error) setNotice(`Playback error: ${error}`);
  }, [error]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 7000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const playById = (id: string) => {
    const t = mockCatalog.getTrack(id);
    if (t) playTrack(t);
  };

  const openFile = async () => {
    try {
      const picked = await pickLocalTrack();
      if (picked) playTrack(picked);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Couldn't open that file.");
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative h-full overflow-hidden bg-void">
        <Ambient hue={track?.hue ?? 265} />

        {/* Main app. Inert while Now Playing is open so focus stays in the overlay. */}
        <div className="relative z-10 flex h-full gap-3 p-3" inert={nowPlayingOpen}>
          <Sidebar
            current={screen}
            onNavigate={setScreen}
            onSelectPlaylist={playById}
            onOpenFile={isTauriRuntime() ? openFile : undefined}
          />

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

        {/* Notices (file errors and playback errors) */}
        <div className="pointer-events-none absolute inset-x-0 top-5 z-50 flex justify-center px-6">
          <AnimatePresence>
            {notice && (
              <motion.div
                key="notice"
                role="alert"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="glass-float pointer-events-auto flex max-w-[560px] items-center gap-4 rounded-2xl px-5 py-3 text-sm"
              >
                <span className="min-w-0 flex-1 text-ink-2">{notice}</span>
                <button
                  type="button"
                  onClick={() => setNotice(null)}
                  className="shrink-0 rounded-full px-3 py-1 text-xs text-ink-3 transition-colors hover:bg-white/[0.08] hover:text-ink"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <PlayerProvider catalog={mockCatalog} createEngine={createEngine}>
      <Shell />
    </PlayerProvider>
  );
}