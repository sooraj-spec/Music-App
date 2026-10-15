import type { ReactNode } from "react";
import { Artwork } from "./Artwork";
import { MusicIcon, PlayIcon } from "./Icons";
import type { ArtVariant, Track } from "../types";

export function SectionTitle({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className="flex items-baseline gap-3">
        <h2 className="t-headline">{title}</h2>
        {meta && <span className="t-caption tabular-nums">{meta}</span>}
      </div>
      {action}
    </div>
  );
}

const REVEAL =
  "translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100";

interface CoverCardProps {
  title: string;
  subtitle: string;
  hue: number;
  art: ArtVariant;
  /** Round artwork, used for artists. */
  round?: boolean;
  selected?: boolean;
  onSelect: () => void;
}

/** Artwork-led card for playlists, albums and artists. */
export function CoverCard({
  title,
  subtitle,
  hue,
  art,
  round = false,
  selected = false,
  onSelect,
}: CoverCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Play ${title}`}
      className="group min-w-0 text-left"
    >
      <div
        className={`relative overflow-hidden shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:-translate-y-1 ${
          round ? "rounded-full" : "rounded-2xl"
        }`}
      >
        <Artwork
          hue={hue}
          variant={art}
          className="aspect-square w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <span
          className={`absolute flex h-11 w-11 items-center justify-center rounded-full bg-ink text-void shadow-lg shadow-black/40 ${REVEAL} ${
            round ? "inset-0 m-auto" : "bottom-3 right-3"
          }`}
        >
          <PlayIcon className="h-4 w-4 translate-x-px" />
        </span>
      </div>
      <div className={`mt-3.5 flex items-center gap-1.5 ${round ? "justify-center" : ""}`}>
        <p className={`t-title truncate ${selected ? "text-violet" : ""}`}>{title}</p>
        {selected && <MusicIcon className="h-3.5 w-3.5 shrink-0 text-violet" />}
      </div>
      <p className={`t-caption mt-0.5 truncate ${round ? "text-center" : ""}`}>{subtitle}</p>
    </button>
  );
}

interface TrackRowProps {
  track: Track;
  active: boolean;
  onPlay: (track: Track) => void;
  showAlbum?: boolean;
}

/** One track in a list. The columns line up with the header in Library. */
export function TrackRow({ track, active, onPlay, showAlbum = true }: TrackRowProps) {
  return (
    <button
      type="button"
      onClick={() => onPlay(track)}
      aria-label={`Play ${track.title} by ${track.artist}`}
      aria-current={active ? "true" : undefined}
      className={`group flex w-full items-center gap-4 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-white/[0.05] ${
        active ? "bg-white/[0.05]" : ""
      }`}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <Artwork
          hue={track.hue}
          variant={track.art}
          className="h-full w-full transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-ink opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <PlayIcon className="h-4 w-4" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={`t-title truncate ${active ? "text-violet" : ""}`}>{track.title}</p>
        <p className="t-caption truncate">{track.artist}</p>
      </div>
      {showAlbum && <span className="t-caption hidden w-52 truncate lg:block">{track.album}</span>}
      <span className="flex w-4 shrink-0 justify-center text-violet">
        {active && <MusicIcon className="h-4 w-4" />}
      </span>
      <span className="t-caption w-10 text-right tabular-nums">{track.duration}</span>
    </button>
  );
}