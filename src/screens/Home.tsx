import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Artwork } from "../components/Artwork";
import { EmptyState } from "../components/EmptyState";
import { MusicIcon, PlayIcon } from "../components/Icons";
import { DISCOVER, FEATURED, PLAYLISTS, RECENT, findTrack } from "../data/mock";
import { EASE } from "../lib/motion";
import type { Track } from "../types";

// Simulated loading only runs the first time Home is shown.
let homeLoadedOnce = false;

function editorial() {
  const now = new Date();
  const h = now.getHours();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  if (h < 5) return { eyebrow: `${day} night`, heading: "Late hours, low light." };
  if (h < 12) return { eyebrow: `${day} morning`, heading: "Begin gently." };
  if (h < 18) return { eyebrow: `${day} afternoon`, heading: "Find your focus." };
  return { eyebrow: `${day} evening`, heading: "Tonight, slow down." };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Bone({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-3xl bg-white/[0.05] motion-reduce:animate-none ${className}`} />
  );
}

function PlayBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-ink text-void shadow-lg shadow-black/40 ${className}`}
    >
      <PlayIcon className="h-4 w-4 translate-x-px" />
    </span>
  );
}

const REVEAL_ON_HOVER =
  "translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100";

function SectionHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="t-headline">{title}</h2>
      {note && <p className="t-caption hidden sm:block">{note}</p>}
    </div>
  );
}

export function Home({
  currentTrackId,
  onPlayTrack,
}: {
  currentTrackId?: string;
  onPlayTrack: (track: Track) => void;
}) {
  const [loading, setLoading] = useState(!homeLoadedOnce);

  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => {
      homeLoadedOnce = true;
      setLoading(false);
    }, 700);
    return () => window.clearTimeout(id);
  }, [loading]);

  const { eyebrow, heading } = editorial();

  const playLead = (id: string) => {
    const t = findTrack(id);
    if (t) onPlayTrack(t);
  };

  const [lead, ...rest] = RECENT;

  return (
    <div className="@container mx-auto w-full max-w-[1120px] px-9 pb-40 pt-12">
      {/* Editorial heading */}
      <Reveal>
        <p className="t-eyebrow">{eyebrow}</p>
        <h1 className="t-display mt-4 max-w-[14ch]">{heading}</h1>
        <p className="t-body mt-5 max-w-md">
          Pick up where you left off, or let a mix set the mood.
        </p>
      </Reveal>

      {/* Featured mix */}
      {loading ? (
        <Bone className="mt-10 h-[340px]" />
      ) : (
        <Reveal delay={0.08} className="mt-10">
          <section className="glass relative overflow-hidden rounded-[28px]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(60% 100% at 100% 0%, hsl(${FEATURED.hue} 70% 50% / 0.22), transparent 70%)`,
              }}
            />
            <div className="relative grid items-center gap-8 p-8 @3xl:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] @3xl:gap-12 @3xl:p-12">
              <div>
                <p className="t-eyebrow text-violet">{FEATURED.eyebrow}</p>
                <h2 className="mt-4 text-[clamp(2.5rem,4.6vw,4rem)] font-semibold leading-none tracking-[-0.045em]">
                  {FEATURED.title}
                </h2>
                <p className="t-body mt-4 max-w-sm">{FEATURED.description}</p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <motion.button
                    type="button"
                    onClick={() => playLead(FEATURED.leadTrackId)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-12 items-center gap-2.5 rounded-full bg-ink pl-5 pr-6 text-sm font-semibold text-void"
                  >
                    <PlayIcon className="h-3.5 w-3.5" />
                    Play mix
                  </motion.button>
                  <span className="t-caption">{FEATURED.meta}</span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.03, rotate: -1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="mx-auto w-full max-w-[320px]"
              >
                <Artwork
                  hue={FEATURED.hue}
                  variant={FEATURED.art}
                  className="aspect-square w-full rounded-3xl shadow-[0_32px_70px_-24px_rgba(0,0,0,0.9)]"
                />
              </motion.div>
            </div>
          </section>
        </Reveal>
      )}

      {/* Recently played: one large piece, then a quiet list */}
      <Reveal delay={0.16} className="mt-16">
        <SectionHeader title="Recently played" />
        {loading ? (
          <div className="mt-6 grid gap-4 @3xl:grid-cols-2">
            <Bone className="aspect-square" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Bone key={i} className="h-[76px] rounded-2xl" />
              ))}
            </div>
          </div>
        ) : !lead ? (
          <div className="mt-6">
            <EmptyState
              icon={<MusicIcon className="h-5 w-5" />}
              title="Nothing played yet"
              body="Tracks you listen to will show up here."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-10 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] @3xl:items-start">
            <button
              type="button"
              onClick={() => onPlayTrack(lead)}
              className="group block w-full max-w-[440px] text-left"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-[0_28px_60px_-24px_rgba(0,0,0,0.85)]">
                <Artwork
                  hue={lead.hue}
                  variant={lead.art}
                  className="aspect-square w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <PlayBadge className={`absolute bottom-4 right-4 ${REVEAL_ON_HOVER}`} />
              </div>
              <p className="mt-5 text-xl font-semibold tracking-[-0.03em]">{lead.title}</p>
              <p className="t-caption mt-1 text-sm">
                {lead.artist} · {lead.album}
              </p>
            </button>

            <ul className="flex flex-col">
              {rest.map((t, i) => {
                const active = t.id === currentTrackId;
                return (
                  <li key={t.id} className={i < rest.length - 1 ? "border-b border-hairline" : ""}>
                    <button
                      type="button"
                      onClick={() => onPlayTrack(t)}
                      className="group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="shrink-0 overflow-hidden rounded-xl">
                        <Artwork
                          hue={t.hue}
                          variant={t.art}
                          className="h-14 w-14 transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`t-title truncate ${active ? "text-violet" : ""}`}>{t.title}</p>
                        <p className="t-caption truncate">{t.artist}</p>
                      </div>
                      {active && <MusicIcon className="h-4 w-4 shrink-0 text-violet" />}
                      <span className="t-caption w-10 text-right tabular-nums">{t.duration}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Reveal>

      {/* Discover */}
      <Reveal delay={0.24} className="mt-16">
        <SectionHeader title="Discover" note="Sample picks. Online discovery comes later." />
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <Bone key={i} className="aspect-square" />)
            : DISCOVER.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => playLead(c.leadTrackId)}
                  className="group min-w-0 text-left"
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)] transition-transform duration-500 group-hover:-translate-y-1">
                    <Artwork
                      hue={c.hue}
                      variant={c.art}
                      className="aspect-square w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                    <PlayBadge className={`absolute bottom-3 right-3 ${REVEAL_ON_HOVER}`} />
                  </div>
                  <p className="t-title mt-3.5 truncate">{c.title}</p>
                  <p className="t-caption mt-0.5 truncate">{c.subtitle}</p>
                </button>
              ))}
        </div>
      </Reveal>

      {/* Playlists */}
      <Reveal delay={0.32} className="mt-16">
        <SectionHeader title="Your playlists" />
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <Bone key={i} className="h-20 rounded-2xl" />)
            : PLAYLISTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => playLead(p.leadTrackId)}
                  className="group flex min-w-0 items-center gap-4 rounded-2xl border border-hairline p-3 text-left transition-colors hover:bg-white/[0.05]"
                >
                  <div className="shrink-0 overflow-hidden rounded-xl">
                    <Artwork
                      hue={p.hue}
                      variant={p.art}
                      className="h-14 w-14 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="t-title truncate">{p.title}</p>
                    <p className="t-caption">{p.subtitle}</p>
                  </div>
                </button>
              ))}
        </div>
      </Reveal>
    </div>
  );
}