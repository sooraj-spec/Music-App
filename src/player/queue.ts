import type { QueueItem, Track } from "../types";

export function makeItems(tracks: readonly Track[], startId: number): QueueItem[] {
  return tracks.map((track, i) => ({ queueId: `q${startId + i}`, track }));
}

/** Small seeded random generator (mulberry32), so the reducer stays pure. */
function seededRandom(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random order with `first` kept at the front. */
export function shuffleKeepingFirst(
  items: readonly QueueItem[],
  first: QueueItem | undefined,
  seed: number,
): QueueItem[] {
  const rest = items.filter((i) => i.queueId !== first?.queueId);
  const random = seededRandom(seed);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first ? [first, ...rest] : rest;
}