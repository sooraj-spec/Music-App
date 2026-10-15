import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ambient } from "./Ambient";
import { Artwork } from "./Artwork";
import { IconButton } from "./IconButton";
import { PlayButton } from "./PlayButton";
import { Slider } from "./Slider";
import { Waveform } from "./Waveform";
import {
  ChevronDownIcon,
  HeartIcon,
  MusicIcon,
  NextIcon,
  PrevIcon,
  QueueIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
} from "./Icons";
import { EASE } from "../lib/motion";
import { formatTime, toSeconds } from "../lib/format";
import type { PlayerApi } from "../types";

interface NowPlayingProps {
  player: PlayerApi;
  onClose: () => void;
}

export function NowPlaying({ player, onClose }: NowPlayingProps) {
  const [queueOpen, setQueueOpen] = useState(false);
  const { track, isPlaying, progress, volume, shuffle, repeat, liked, upcoming } = player;

  // Escape closes the queue first, then Now Playing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (queueOpen) setQueueOpen(false);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queueOpen, onClose]);

  if (!track) return null;

  const total = toSeconds(track.duration);
  const elapsed = formatTime(total * progress);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Now playing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="absolute inset-0 z-40 bg-void"
    >
      <Ambient hue={track.hue} strong />

      <div className="relative h-full overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-[1180px] flex-col px-10 pb-8">
          {/* Header */}
          <header className="flex h-[72px] shrink-0 items-center justify-between">
            <button
              type="button"
              autoFocus
              onClick={onClose}
              aria-label="Close Now Playing"
              className="flex items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
            >
              <ChevronDownIcon className="h-5 w-5" />
              Back
            </button>
            <p className="t-eyebrow">Now playing</p>
            <div className="w-[88px]" aria-hidden />
          </header>

          {/* Composition: artwork left, details right */}
          <div className="grid flex-1 grid-cols-2 items-center gap-10 min-[1100px]:gap-16">
            <div className="flex justify-center min-[1100px]:justify-end">
              <motion.div
                layoutId="player-art"
                style={{ borderRadius: 28 }}
                className="aspect-square w-[min(100%,520px,calc(100vh_-_220px))] overflow-hidden shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]"
              >
                <motion.div
                  animate={{ scale: isPlaying ? 1 : 0.965 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  className="h-full w-full"
                >
                  <Artwork hue={track.hue} variant={track.art} className="h-full w-full" />
                </motion.div>
              </motion.div>
            </div>

            <div className="max-w-[460px]">
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="t-eyebrow">{track.album}</p>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="line-clamp-2 text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.04em]">
                      {track.title}
                    </h1>
                    <p className="t-body mt-2">{track.artist}</p>
                  </div>
                  <IconButton
                    label={liked ? "Remove from liked songs" : "Like track"}
                    pressed={liked}
                    onClick={player.toggleLike}
                  >
                    <HeartIcon className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
                  </IconButton>
                </div>
              </motion.div>

              {/* Waveform + seek */}
              <div className="mt-8">
                <Waveform seed={track.id} progress={progress} />
                <div className="mt-3">
                  <Slider
                    value={progress}
                    onChange={player.seek}
                    label="Seek"
                    valueText={`${elapsed} of ${track.duration}`}
                  />
                </div>
                <div className="t-caption mt-2 flex justify-between text-xs tabular-nums">
                  <span>{elapsed}</span>
                  <span>{track.duration}</span>
                </div>
              </div>

              {/* Primary controls */}
              <div className="mt-6 flex items-center justify-between">
                <IconButton label="Shuffle" pressed={shuffle} onClick={player.toggleShuffle}>
                  <ShuffleIcon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Previous track" onClick={player.prev} className="h-11 w-11">
                  <PrevIcon className="h-5 w-5" />
                </IconButton>
                <PlayButton isPlaying={isPlaying} onClick={player.togglePlay} large />
                <IconButton label="Next track" onClick={player.next} className="h-11 w-11">
                  <NextIcon className="h-5 w-5" />
                </IconButton>
                <IconButton label="Repeat" pressed={repeat} onClick={player.toggleRepeat}>
                  <RepeatIcon className="h-[18px] w-[18px]" />
                </IconButton>
              </div>

              {/* Secondary: volume and queue */}
              <div className="mt-6 flex items-center justify-between gap-6">
                <div className="flex w-44 items-center gap-3 text-ink-3">
                  <VolumeIcon className="h-[18px] w-[18px] shrink-0" />
                  <Slider
                    value={volume}
                    onChange={player.setVolume}
                    label="Volume"
                    valueText={`${Math.round(volume * 100)}%`}
                    fill="rgba(181,178,196,0.9)"
                  />
                </div>
                <IconButton
                  label={queueOpen ? "Hide queue" : "Show queue"}
                  pressed={queueOpen}
                  onClick={() => setQueueOpen((o) => !o)}
                >
                  <QueueIcon className="h-[18px] w-[18px]" />
                </IconButton>
              </div>

              <p className="t-caption mt-6 text-[11px]">
                Preview controls only. Audio arrives in a later phase.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue drawer */}
      <AnimatePresence>
        {queueOpen && (
          <motion.aside
            key="queue"
            aria-label="Queue"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="glass-float absolute bottom-5 right-5 top-[84px] z-10 flex w-[340px] flex-col rounded-3xl p-5"
          >
            <p className="t-eyebrow">Playing now</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="shrink-0 overflow-hidden rounded-lg">
                <Artwork hue={track.hue} variant={track.art} className="h-11 w-11" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="t-title truncate text-violet">{track.title}</p>
                <p className="t-caption truncate">{track.artist}</p>
              </div>
              <MusicIcon className="h-4 w-4 shrink-0 text-violet" />
            </div>

            <p className="t-eyebrow mt-7">Next up</p>
            {shuffle && (
              <p className="t-caption mt-2 text-xs">
                Shuffle is on, so the next track is picked at random.
              </p>
            )}
            {upcoming.length === 0 ? (
              <p className="t-caption mt-3 text-sm">
                That's the end of the list. Turn on repeat to loop it.
              </p>
            ) : (
              <ul className="-mx-2 mt-2 min-h-0 flex-1 overflow-y-auto">
                {upcoming.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => player.playTrack(t)}
                      className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <div className="shrink-0 overflow-hidden rounded-lg">
                        <Artwork
                          hue={t.hue}
                          variant={t.art}
                          className="h-11 w-11 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="t-title truncate">{t.title}</p>
                        <p className="t-caption truncate">{t.artist}</p>
                      </div>
                      <span className="t-caption text-xs tabular-nums">{t.duration}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.div>
  );
}