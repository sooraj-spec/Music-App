interface SliderProps {
  /** 0 to 1 */
  value: number;
  onChange: (value: number) => void;
  label: string;
  valueText?: string;
  fill?: string;
  className?: string;
}

/** Accessible range input used for seeking and volume. Keyboard arrows work natively. */
export function Slider({
  value,
  onChange,
  label,
  valueText,
  fill = "rgba(243,241,248,0.88)",
  className = "",
}: SliderProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const pct = Math.round(clamped * 1000) / 10;

  return (
    <input
      type="range"
      min={0}
      max={1000}
      step={1}
      value={Math.round(clamped * 1000)}
      onChange={(e) => onChange(Number(e.target.value) / 1000)}
      aria-label={label}
      aria-valuetext={valueText}
      style={{
        background: `linear-gradient(to right, ${fill} ${pct}%, rgba(255,255,255,0.14) ${pct}%)`,
      }}
      className={`h-1 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:opacity-0 [&::-webkit-slider-thumb]:transition-opacity hover:[&::-webkit-slider-thumb]:opacity-100 focus-visible:[&::-webkit-slider-thumb]:opacity-100 ${className}`}
    />
  );
}