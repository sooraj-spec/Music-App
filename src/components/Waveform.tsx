import { useMemo } from "react";
import { motion } from "motion/react";
import { waveformFor } from "../lib/waveform";

interface WaveformProps {
  seed: string;
  /** 0 to 1 */
  progress: number;
  bars?: number;
}

/** Decorative, static waveform (generated from the track id, not from audio). */
export function Waveform({ seed, progress, bars = 56 }: WaveformProps) {
  const heights = useMemo(() => waveformFor(seed, bars), [seed, bars]);

  return (
    <motion.div
      key={seed}
      aria-hidden
      initial={{ opacity: 0, scaleY: 0.6 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-14 items-center gap-[3px]"
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: `${h * 100}%`,
            background:
              i / bars < progress ? "rgba(243,241,248,0.85)" : "rgba(255,255,255,0.16)",
          }}
        />
      ))}
    </motion.div>
  );
}