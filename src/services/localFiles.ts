import { open } from "@tauri-apps/plugin-dialog";
import { formatTime } from "../lib/format";
import { call } from "../lib/tauri";
import type { ArtVariant, Track } from "../types";

const EXTENSIONS = ["mp3", "flac", "ogg", "wav"];
const ART: ArtVariant[] = ["orb", "horizon", "rings", "prism"];

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function trackFromFile(path: string, durationSec: number): Track {
  const parts = path.split(/[\\/]/);
  const file = parts[parts.length - 1] || path;
  const folder = parts.length > 1 ? parts[parts.length - 2] : "";
  const h = hash(path);
  return {
    id: `local-${h.toString(16)}`,
    title: file.replace(/\.[^.]+$/, "") || file,
    artist: "Local file",
    album: folder || "Local files",
    hue: h % 360,
    art: ART[h % ART.length] ?? "orb",
    // Rounded up so the displayed duration is never shorter than the real one.
    duration: formatTime(Math.ceil(durationSec)),
    source: { kind: "local-file", path },
  };
}

/**
 * Opens the native file dialog and returns a playable track, or null if cancelled.
 * Throws an Error with a readable message if the file can't be read or decoded.
 */
export async function pickLocalTrack(): Promise<Track | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Audio", extensions: EXTENSIONS }],
  });
  if (typeof selected !== "string") return null;

  const info = await call<{ durationSec: number }>("audio_probe", { path: selected });
  return trackFromFile(selected, info.durationSec);
}