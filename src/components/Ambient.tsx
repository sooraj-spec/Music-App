import { AnimatePresence, motion } from "motion/react";

interface AmbientProps {
  hue: number;
  /** Stronger, centered wash used behind Now Playing. */
  strong?: boolean;
}

/** Soft color wash derived from the current track. Static gradients only (no animated blur). */
export function Ambient({ hue, strong = false }: AmbientProps) {
  const a = strong ? 0.36 : 0.26;
  const b = strong ? 0.22 : 0.14;
  const first = strong ? "70% 60% at 28% 40%" : "55% 48% at 20% 0%";

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
            background: `radial-gradient(${first}, hsl(${hue} 70% 46% / ${a}), transparent 70%), radial-gradient(48% 44% at 100% 100%, hsl(${(hue + 50) % 360} 60% 40% / ${b}), transparent 70%)`,
          }}
        />
      </AnimatePresence>
    </div>
  );
}