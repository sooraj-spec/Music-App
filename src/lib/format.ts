/** Fake elapsed time for the preview player (there is no audio yet). */
export function mockElapsed(duration: string, fraction: number): string {
  const [m, s] = duration.split(":").map(Number);
  const total = Math.round((m * 60 + s) * fraction);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}