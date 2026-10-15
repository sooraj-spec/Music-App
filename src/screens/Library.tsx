import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { EmptyState } from "../components/EmptyState";
import { FolderIcon, MusicIcon } from "../components/Icons";
import { CoverCard, SectionTitle, TrackRow } from "../components/MediaParts";
import { PLAYLISTS, TRACKS } from "../data/mock";
import { ALBUMS, ARTISTS, leadOf } from "../lib/library";
import { EASE } from "../lib/motion";
import type { Track } from "../types";

type Filter = "all" | "playlists" | "albums" | "artists" | "tracks";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "playlists", label: "Playlists" },
  { id: "albums", label: "Albums" },
  { id: "artists", label: "Artists" },
  { id: "tracks", label: "Tracks" },
];

const COUNTS: Record<Exclude<Filter, "all">, number> = {
  playlists: PLAYLISTS.length,
  albums: ALBUMS.length,
  artists: ARTISTS.length,
  tracks: TRACKS.length,
};

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6";
const PREVIEW_TRACKS = 5;

function Block({
  title,
  count,
  emptyText,
  action,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <SectionTitle title={title} meta={String(count)} action={action} />
      <div className="mt-6">
        {count === 0 ? (
          <EmptyState
            icon={<MusicIcon className="h-5 w-5" />}
            title={`No ${title.toLowerCase()} yet`}
            body={emptyText}
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

interface LibraryProps {
  currentTrack: Track | null;
  onPlayTrack: (track: Track) => void;
}

export function Library({ currentTrack, onPlayTrack }: LibraryProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const show = (id: Exclude<Filter, "all">) => filter === "all" || filter === id;
  const empty = TRACKS.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-9 pb-40 pt-12">
      <p className="t-eyebrow">Library</p>
      <h1 className="t-display mt-4">Your music.</h1>
      <p className="t-body mt-5 max-w-lg">
        {COUNTS.tracks} tracks · {COUNTS.albums} albums · {COUNTS.artists} artists ·{" "}
        {COUNTS.playlists} playlists
      </p>
      <p className="t-caption mt-1">
        A sample collection to design with. Your own files arrive with local playback.
      </p>

      {empty ? (
        <div className="mt-10">
          <EmptyState
            icon={<FolderIcon className="h-5 w-5" />}
            title="Your library is empty"
            body="Music you add will appear here. Importing local files arrives in a later phase."
          />
        </div>
      ) : (
        <>
          <div role="group" aria-label="Filter library" className="mt-8 flex flex-wrap gap-1.5">
            {FILTERS.map(({ id, label }) => {
              const active = id === filter;
              const count = id === "all" ? null : COUNTS[id];
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(id)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-ink" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="library-filter"
                      className="absolute inset-0 rounded-full bg-white/[0.09]"
                      transition={{ type: "spring", stiffness: 500, damping: 42 }}
                    />
                  )}
                  <span className="relative">
                    {label}
                    {count !== null && <span className="ml-1.5 tabular-nums text-ink-3">{count}</span>}
                  </span>
                </button>
              );
            })}
          </div>

          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {show("playlists") && (
              <Block
                title="Playlists"
                count={COUNTS.playlists}
                emptyText="Playlists you create will appear here."
              >
                <div className={GRID}>
                  {PLAYLISTS.map((p) => (
                    <CoverCard
                      key={p.id}
                      title={p.title}
                      subtitle={p.subtitle}
                      hue={p.hue}
                      art={p.art}
                      onSelect={() => {
                        const lead = leadOf(p);
                        if (lead) onPlayTrack(lead);
                      }}
                    />
                  ))}
                </div>
              </Block>
            )}

            {show("albums") && (
              <Block
                title="Albums"
                count={COUNTS.albums}
                emptyText="Albums from your music will appear here."
              >
                <div className={GRID}>
                  {ALBUMS.map((a) => (
                    <CoverCard
                      key={a.id}
                      title={a.title}
                      subtitle={`${a.artist} · ${a.tracks.length} track${a.tracks.length === 1 ? "" : "s"}`}
                      hue={a.hue}
                      art={a.art}
                      selected={a.title === currentTrack?.album && a.artist === currentTrack?.artist}
                      onSelect={() => onPlayTrack(a.tracks[0])}
                    />
                  ))}
                </div>
              </Block>
            )}

            {show("artists") && (
              <Block
                title="Artists"
                count={COUNTS.artists}
                emptyText="Artists from your music will appear here."
              >
                <div className={GRID}>
                  {ARTISTS.map((a) => (
                    <CoverCard
                      key={a.id}
                      round
                      title={a.name}
                      subtitle={`${a.tracks.length} track${a.tracks.length === 1 ? "" : "s"}`}
                      hue={a.hue}
                      art={a.art}
                      selected={a.name === currentTrack?.artist}
                      onSelect={() => onPlayTrack(a.tracks[0])}
                    />
                  ))}
                </div>
              </Block>
            )}

            {show("tracks") && (
              <Block
                title="Tracks"
                count={COUNTS.tracks}
                emptyText="Tracks from your music will appear here."
                action={
                  filter === "all" && TRACKS.length > PREVIEW_TRACKS ? (
                    <button
                      type="button"
                      onClick={() => setFilter("tracks")}
                      className="rounded-full px-3 py-1 text-sm text-violet transition-colors hover:bg-violet-soft"
                    >
                      Show all {TRACKS.length}
                    </button>
                  ) : undefined
                }
              >
                {filter === "tracks" && (
                  <div className="t-eyebrow flex items-center gap-4 border-b border-hairline px-3 pb-3">
                    <span className="w-14 shrink-0" />
                    <span className="flex-1">Title</span>
                    <span className="hidden w-52 lg:block">Album</span>
                    <span className="w-4 shrink-0" />
                    <span className="w-10 text-right">Time</span>
                  </div>
                )}
                <div className={`flex flex-col ${filter === "tracks" ? "mt-2" : ""}`}>
                  {(filter === "all" ? TRACKS.slice(0, PREVIEW_TRACKS) : TRACKS).map((t) => (
                    <TrackRow
                      key={t.id}
                      track={t}
                      active={t.id === currentTrack?.id}
                      onPlay={onPlayTrack}
                    />
                  ))}
                </div>
              </Block>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}