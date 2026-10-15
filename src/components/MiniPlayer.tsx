import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Artwork } from "./Artwork";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon } from "./Icons";
import { mockElapsed } from "../lib/format";
import type { Track } from "../types";

// Static placeholder: there is no audio engine yet.
const MOCK_FRACTION = 0.34;

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Ctl({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors hover:text-ink disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}

export function MiniPlayer({ track, isPlaying, onTogglePlay, onPrev, onNext }: MiniPlayerProps) {
  const none = track === null;

  return (
    <div className="glass-float grid h-20 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 rounded-[24px] px-4">
      {/* Track */}
      <div className="flex min-w-0 items-center">
        {track ? (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-w-0 items-center gap-3.5"
          >
            <Artwork
              hue={track.hue}
              variant={track.art}
              className="h-14 w-14 shrink-0 rounded-xl shadow-lg shadow-black/40"
            />
            <div className="min-w-0">
              <p className="t-title truncate">{track.title}</p>
              <p className="t-caption truncate">{track.artist}</p>
            </div>
          </motion.div>
        ) : (
          <p className="t-caption">Nothing playing</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <Ctl label="Previous track" onClick={onPrev} disabled={none}>
          <PrevIcon className="h-[18px] w-[18px]" />
        </Ctl>
        <motion.button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={onTogglePlay}
          disabled={none}
          whileHover={none ? undefined : { scale: 1.05 }}
          whileTap={none ? undefined : { scale: 0.92 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-void disabled:opacity-40"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isPlaying ? "pause" : "play"}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.12 }}
              className="flex"
            >
              {isPlaying ? <PauseIcon className="h-[18px] w-[18px]" /> : <PlayIcon className="h-[18px] w-[18px]" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <Ctl label="Next track" onClick={onNext} disabled={none}>
          <NextIcon className="h-[18px] w-[18px]" />
        </Ctl>
      </div>

      {/* Progress (preview only) */}
      <div className="flex items-center justify-end">
        {track && (
          <div className="t-caption hidden w-full max-w-[240px] items-center gap-3 text-xs tabular-nums md:flex">
            <span>{mockElapsed(track.duration, MOCK_FRACTION)}</span>
            <div
              role="progressbar"
              aria-label="Track progress (preview only)"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={MOCK_FRACTION * 100}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10"
            >
              <div className="h-full rounded-full bg-ink/80" style={{ width: `${MOCK_FRACTION * 100}%` }} />
            </div>
            <span>{track.duration}</span>
          </div>
        )}
      </div>
    </div>
  );
}