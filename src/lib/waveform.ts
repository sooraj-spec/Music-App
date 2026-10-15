/** Deterministic pseudo-waveform: the same seed always gives the same bars. */
export function waveformFor(seed: string, bars = 56): number[] {
  let x = 2166136261;
  for (const ch of seed) {
    x ^= ch.charCodeAt(0);
    x = Math.imul(x, 16777619);
  }
  x >>>= 0;

  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    const r = x / 4294967296;
    const envelope = 0.55 + 0.45 * Math.sin((i / (bars - 1)) * Math.PI);
    out.push(0.16 + 0.84 * r * envelope);
  }
  return out;
}