import { AnimatePresence, motion } from "motion/react";
import { PauseIcon, PlayIcon } from "./Icons";

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  disabled?: boolean;
  large?: boolean;
}

export function PlayButton({ isPlaying, onClick, disabled, large = false }: PlayButtonProps) {
  const icon = large ? "h-6 w-6" : "h-[18px] w-[18px]";

  return (
    <motion.button
      type="button"
      aria-label={isPlaying ? "Pause" : "Play"}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-ink text-void disabled:opacity-40 ${
        large ? "h-[68px] w-[68px]" : "h-12 w-12"
      }`}
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
          {isPlaying ? <PauseIcon className={icon} /> : <PlayIcon className={icon} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}