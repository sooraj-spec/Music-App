import type { ReactNode } from "react";
import { motion } from "motion/react";

interface IconButtonProps {
  label: string;
  onClick: () => void;
  /** Set for toggle buttons (shuffle, repeat, like, queue). */
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function IconButton({
  label,
  onClick,
  pressed,
  disabled,
  className = "",
  children,
}: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.88 }}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/[0.06] disabled:opacity-40 disabled:hover:bg-transparent ${
        pressed ? "text-violet" : "text-ink-2 hover:text-ink"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}