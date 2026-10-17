import { motion } from "motion/react";
import { Artwork } from "./Artwork";
import { IconButton } from "./IconButton";
import { PlayButton } from "./PlayButton";
import { ChevronDownIcon, NextIcon, PrevIcon } from "./Icons";
import { formatTime } from "../lib/format";
import {
  usePlaybackPosition,
  usePlayerActions,
  usePlayerState,
} from "../player/PlayerProvider";

interface MiniPlayerProps {
  /** True while Now Playing is open (hands the artwork transition over to it). */
  expanded: boolean;
  onOpen: () => void;
}

export function MiniPlayer({ expanded, onOpen }: MiniPlayerProps) {
  const { track, isPlaying, durationSec } = usePlayerState();
  const actions = usePlayerActions();
  const position = usePlaybackPosition();

  const none = track === null;
  const fraction = durationSec > 0 ? Math.min(position / durationSec, 1) : 0;

  return (
    <div className="glass-float grid h-20 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 rounded-[24px] px-4">
      {/* Track: click to open Now Playing */}
      <div className="flex min-w-0 items-center">
        {track ? (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Open Now Playing: ${track.title} by ${track.artist}`}
            className="group flex min-w-0 items-center gap-3.5 rounded-2xl p-1 text-left"
          >
            <motion.div
              layoutId={expanded ? undefined : "player-art"}
              style={{ borderRadius: 12 }}
              className="h-14 w-14 shrink-0 overflow-hidden shadow-lg shadow-black/40 transition-transform duration-300 group-hover:scale-105"
            >
              <Artwork hue={track.hue} variant={track.art} className="h-full w-full" />
            </motion.div>
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-w-0"
            >
              <p className="t-title truncate">{track.title}</p>
              <p className="t-caption truncate">{track.artist}</p>
            </motion.div>
          </button>
        ) : (
          <div className="flex items-center gap-3.5 p-1">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-white/[0.05]" />
            <p className="t-caption">Nothing playing</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <IconButton label="Previous track" onClick={actions.playPrevious} disabled={none}>
          <PrevIcon className="h-[18px] w-[18px]" />
        </IconButton>
        <PlayButton isPlaying={isPlaying} onClick={actions.togglePlayPause} disabled={none} />
        <IconButton label="Next track" onClick={actions.playNext} disabled={none}>
          <NextIcon className="h-[18px] w-[18px]" />
        </IconButton>
      </div>

      {/* Progress (read-only here) and expand */}
      <div className="flex items-center justify-end gap-3">
        {track && (
          <div className="t-caption hidden w-full max-w-[190px] items-center gap-3 text-xs tabular-nums md:flex">
            <span>{formatTime(position)}</span>
            <div
              role="progressbar"
              aria-label="Track progress (simulated)"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(fraction * 100)}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full rounded-full bg-ink/80 transition-[width] duration-300 ease-linear"
                style={{ width: `${fraction * 100}%` }}
              />
            </div>
            <span>{track.duration}</span>
          </div>
        )}
        <IconButton label="Open Now Playing" onClick={onOpen} disabled={none}>
          <ChevronDownIcon className="h-5 w-5 rotate-180" />
        </IconButton>
      </div>
    </div>
  );
}