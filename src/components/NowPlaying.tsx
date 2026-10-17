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
import { formatTime } from "../lib/format";
import {
  usePlaybackPosition,
  usePlayerActions,
  usePlayerState,
} from "../player/PlayerProvider";
import type { RepeatMode } from "../types";

const NEXT_REPEAT: Record<RepeatMode, RepeatMode> = { off: "all", all: "one", one: "off" };
const REPEAT_LABEL: Record<RepeatMode, string> = {
  off: "Repeat: off",
  all: "Repeat: all",
  one: "Repeat: this track",
};

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function NowPlaying({ onClose }: { onClose: () => void }) {
  const [queueOpen, setQueueOpen] = useState(false);
  const state = usePlayerState();
  const actions = usePlayerActions();
  const position = usePlaybackPosition();
  const { track, isPlaying, durationSec, volume, muted, shuffle, repeat, liked, queue, index, error } =
    state;

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

  const fraction = durationSec > 0 ? Math.min(position / durationSec, 1) : 0;
  const elapsed = formatTime(position);
  const silent = muted || volume === 0;
  const upcoming = queue.map((item, i) => ({ item, i })).filter(({ i }) => i > index);

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
                    onClick={actions.toggleLike}
                  >
                    <HeartIcon className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
                  </IconButton>
                </div>
              </motion.div>

              {/* Waveform + seek */}
              <div className="mt-8">
                <Waveform seed={track.id} progress={fraction} />
                <div className="mt-3">
                  <Slider
                    value={fraction}
                    onChange={(f) => actions.seek(f * durationSec)}
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
                <IconButton label="Shuffle" pressed={shuffle} onClick={actions.toggleShuffle}>
                  <ShuffleIcon className="h-[18px] w-[18px]" />
                </IconButton>
                <IconButton label="Previous track" onClick={actions.playPrevious} className="h-11 w-11">
                  <PrevIcon className="h-5 w-5" />
                </IconButton>
                <PlayButton isPlaying={isPlaying} onClick={actions.togglePlayPause} large />
                <IconButton label="Next track" onClick={actions.playNext} className="h-11 w-11">
                  <NextIcon className="h-5 w-5" />
                </IconButton>
                <IconButton
                  label={REPEAT_LABEL[repeat]}
                  pressed={repeat !== "off"}
                  onClick={() => actions.setRepeatMode(NEXT_REPEAT[repeat])}
                >
                  <span className="relative flex">
                    <RepeatIcon className="h-[18px] w-[18px]" />
                    {repeat === "one" && (
                      <span className="absolute -right-1.5 -top-1.5 text-[9px] font-bold leading-none">
                        1
                      </span>
                    )}
                  </span>
                </IconButton>
              </div>

              {/* Secondary: volume and queue */}
              <div className="mt-6 flex items-center justify-between gap-6">
                <div className="flex w-48 items-center gap-1 text-ink-3">
                  <IconButton
                    label={muted ? "Unmute" : "Mute"}
                    pressed={muted}
                    onClick={actions.toggleMute}
                    className="h-9 w-9"
                  >
                    <span className="relative flex">
                      <VolumeIcon className="h-[18px] w-[18px]" />
                      {silent && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 h-[1.5px] w-full -rotate-45 rounded bg-current"
                        />
                      )}
                    </span>
                  </IconButton>
                  <Slider
                    value={muted ? 0 : volume}
                    onChange={actions.setVolume}
                    label="Volume"
                    valueText={muted ? "Muted" : `${Math.round(volume * 100)}%`}
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

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-300">
                  Playback error: {error}
                </p>
              )}
              <p className="t-caption mt-6 text-[11px]">
                {track.source
                  ? "Playing from a local file."
                  : "Sample track: simulated playback, no audio. Use Open audio file in the sidebar to hear real sound."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Click anywhere outside the queue to close it (header stays clickable) */}
      {queueOpen && (
        <div
          aria-hidden
          onClick={() => setQueueOpen(false)}
          className="absolute inset-x-0 bottom-0 top-[72px] z-[5]"
        />
      )}

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

            <div className="mt-7 flex items-center justify-between">
              <p className="t-eyebrow">Next up</p>
              {upcoming.length > 0 && (
                <button
                  type="button"
                  onClick={actions.clearQueue}
                  className="rounded-full px-3 py-1 text-xs text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
                >
                  Clear queue
                </button>
              )}
            </div>

            {(shuffle || repeat !== "off") && (
              <p className="t-caption mt-2 text-xs">
                {[
                  shuffle ? "Shuffled order." : "",
                  repeat === "all" ? "Repeats from the start." : "",
                  repeat === "one" ? "Repeating this track." : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            )}

            {upcoming.length === 0 ? (
              <p className="t-caption mt-3 text-sm">
                Nothing queued after this track.
                {repeat === "off" ? " Turn on repeat to loop the list." : ""}
              </p>
            ) : (
              <ul className="-mx-2 mt-2 min-h-0 flex-1 overflow-y-auto">
                {upcoming.map(({ item, i }) => (
                  <li
                    key={item.queueId}
                    className="group flex items-center gap-1 rounded-xl transition-colors hover:bg-white/[0.05]"
                  >
                    <button
                      type="button"
                      onClick={() => actions.playQueueItem(i)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left"
                    >
                      <div className="shrink-0 overflow-hidden rounded-lg">
                        <Artwork
                          hue={item.track.hue}
                          variant={item.track.art}
                          className="h-11 w-11 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="t-title truncate">{item.track.title}</p>
                        <p className="t-caption truncate">{item.track.artist}</p>
                      </div>
                      <span className="t-caption text-xs tabular-nums">{item.track.duration}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${item.track.title} from queue`}
                      onClick={() => actions.removeFromQueue(i)}
                      className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 opacity-0 transition hover:bg-white/[0.08] hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <CloseIcon />
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