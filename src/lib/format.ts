/** "3:58" to seconds. */
export function toSeconds(duration: string): number {
  const [m, s] = duration.split(":").map(Number);
  return m * 60 + s;
}

/** Seconds to "m:ss". */
export function formatTime(totalSeconds: number): string {
  const t = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/** Fake elapsed time for the preview player (there is no audio yet). */
export function mockElapsed(duration: string, fraction: number): string {
  return formatTime(toSeconds(duration) * fraction);
}