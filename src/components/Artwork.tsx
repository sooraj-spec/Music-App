import type { ArtVariant } from "../types";

interface ArtworkProps {
  hue: number;
  variant?: ArtVariant;
  className?: string;
}

function paint(hue: number, variant: ArtVariant): string {
  const c1 = `hsl(${hue} 72% 64%)`;
  const c2 = `hsl(${(hue + 42) % 360} 66% 46%)`;
  const c3 = `hsl(${(hue + 320) % 360} 52% 24%)`;
  const dk = `hsl(${hue} 38% 9%)`;

  switch (variant) {
    case "horizon":
      return `radial-gradient(circle at 50% 60%, ${c1} 0 17%, transparent 17.5%), linear-gradient(180deg, ${dk} 0%, ${c3} 46%, ${c2} 60%, ${dk} 60.4%, ${c3} 100%)`;
    case "rings":
      return `repeating-radial-gradient(circle at 76% 26%, transparent 0 7%, rgba(255,255,255,0.12) 7.3% 7.8%), radial-gradient(circle at 76% 26%, ${c1}, transparent 58%), linear-gradient(205deg, ${c2}, ${dk} 72%)`;
    case "prism":
      return `conic-gradient(from 215deg at 28% 72%, ${c1}, ${c2}, ${c3}, ${dk}, ${c1})`;
    case "orb":
    default:
      return `radial-gradient(circle at 36% 38%, ${c1} 0 13%, transparent 13.5%), radial-gradient(circle at 36% 38%, ${c2}, transparent 62%), linear-gradient(150deg, ${c3}, ${dk})`;
  }
}

/** Procedural placeholder cover art. Replaced by real artwork later. */
export function Artwork({ hue, variant = "orb", className = "" }: ArtworkProps) {
  return (
    <div
      aria-hidden
      className={`relative overflow-hidden ${className}`}
      style={{ background: paint(hue, variant) }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%)]" />
      <div className="absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]" />
    </div>
  );
}