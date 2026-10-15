import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { EmptyState } from "../components/EmptyState";
import { SearchIcon } from "../components/Icons";
import { CoverCard, SectionTitle, TrackRow } from "../components/MediaParts";
import { SearchField } from "../components/SearchField";
import { ARTISTS, leadOf, searchLibrary } from "../lib/library";
import { EASE } from "../lib/motion";
import type { Track } from "../types";

const GRID = "grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6";
const SUGGESTIONS = ARTISTS.slice(0, 5).map((a) => a.name);

interface SearchProps {
  currentTrack: Track | null;
  onPlayTrack: (track: Track) => void;
}

export function Search({ currentTrack, onPlayTrack }: SearchProps) {
  const [query, setQuery] = useState("");
  const q = query.trim();
  const { tracks, artists, albums, playlists } = useMemo(() => searchLibrary(q), [q]);
  const total = tracks.length + artists.length + albums.length + playlists.length;
  const state = !q ? "empty" : total === 0 ? "none" : "results";

  const playTop = () => {
    const first =
      tracks[0] ??
      artists[0]?.tracks[0] ??
      albums[0]?.tracks[0] ??
      (playlists[0] ? leadOf(playlists[0]) : undefined);
    if (first) onPlayTrack(first);
  };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-9 pb-40 pt-12">
      <p className="t-eyebrow">Search</p>
      <h1 className="t-display mt-4 max-w-[14ch]">Find something to play.</h1>

      <div className="mt-8">
        <SearchField value={query} onChange={setQuery} onSubmit={playTop} />
        <p className="t-caption mt-3 px-2 text-xs" aria-live="polite">
          {state === "results"
            ? `${total} result${total === 1 ? "" : "s"} for "${q}". Press Enter to play the top result.`
            : "Searching the mock collection. Press Esc to clear."}
        </p>
      </div>

      <motion.div
        key={state}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-10"
      >
        {state === "empty" && (
          <EmptyState
            icon={<SearchIcon className="h-5 w-5" />}
            title="Search your library"
            body="Find tracks, artists, albums and playlists in the sample collection."
          >
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setQuery(name)}
                  className="rounded-full border border-hairline px-4 py-1.5 text-sm text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink"
                >
                  {name}
                </button>
              ))}
            </div>
          </EmptyState>
        )}

        {state === "none" && (
          <EmptyState
            icon={<SearchIcon className="h-5 w-5" />}
            title={`No results for "${q}"`}
            body="Check the spelling, or try an artist, album or track name."
          >
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 rounded-full bg-white/[0.07] px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-white/[0.12]"
            >
              Clear search
            </button>
          </EmptyState>
        )}

        {state === "results" && (
          <div className="flex flex-col gap-12">
            {tracks.length > 0 && (
              <section>
                <SectionTitle title="Tracks" meta={String(tracks.length)} />
                <div className="mt-4 flex flex-col">
                  {tracks.map((t) => (
                    <TrackRow
                      key={t.id}
                      track={t}
                      active={t.id === currentTrack?.id}
                      onPlay={onPlayTrack}
                    />
                  ))}
                </div>
              </section>
            )}

            {artists.length > 0 && (
              <section>
                <SectionTitle title="Artists" meta={String(artists.length)} />
                <div className={`${GRID} mt-6`}>
                  {artists.map((a) => (
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
              </section>
            )}

            {albums.length > 0 && (
              <section>
                <SectionTitle title="Albums" meta={String(albums.length)} />
                <div className={`${GRID} mt-6`}>
                  {albums.map((a) => (
                    <CoverCard
                      key={a.id}
                      title={a.title}
                      subtitle={a.artist}
                      hue={a.hue}
                      art={a.art}
                      selected={a.title === currentTrack?.album && a.artist === currentTrack?.artist}
                      onSelect={() => onPlayTrack(a.tracks[0])}
                    />
                  ))}
                </div>
              </section>
            )}

            {playlists.length > 0 && (
              <section>
                <SectionTitle title="Playlists" meta={String(playlists.length)} />
                <div className={`${GRID} mt-6`}>
                  {playlists.map((p) => (
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
              </section>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}