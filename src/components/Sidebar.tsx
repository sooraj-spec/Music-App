import type { ComponentType, SVGProps } from "react";
import { motion } from "motion/react";
import { Artwork } from "./Artwork";
import { HomeIcon, LibraryIcon, SearchIcon, SonicMark } from "./Icons";
import { PLAYLISTS } from "../data/mock";
import type { Screen } from "../types";

const NAV: { id: Screen; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "search", label: "Search", Icon: SearchIcon },
  { id: "library", label: "Library", Icon: LibraryIcon },
];

interface SidebarProps {
  current: Screen;
  onNavigate: (screen: Screen) => void;
  onSelectPlaylist: (leadTrackId: string) => void;
}

export function Sidebar({ current, onNavigate, onSelectPlaylist }: SidebarProps) {
  return (
    <aside className="glass flex w-[84px] shrink-0 flex-col overflow-hidden rounded-3xl min-[1040px]:w-[244px]">
      {/* Brand */}
      <div className="flex h-[92px] shrink-0 items-center gap-3 px-7 max-[1039px]:justify-center max-[1039px]:px-0">
        <SonicMark className="h-6 w-6 shrink-0 text-violet" />
        <span className="hidden text-[22px] font-semibold tracking-[-0.045em] min-[1040px]:inline">
          Sonic
        </span>
      </div>

      {/* Navigation */}
      <nav aria-label="Main" className="flex flex-col gap-1 px-3">
        {NAV.map(({ id, label, Icon }) => {
          const active = id === current;
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              whileTap={{ scale: 0.97 }}
              className={`relative flex h-11 w-full items-center gap-3.5 rounded-xl px-[18px] text-sm font-medium transition-colors max-[1039px]:justify-center max-[1039px]:px-0 ${
                active ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              {active && (
                <>
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-white/[0.07]"
                    transition={{ type: "spring", stiffness: 500, damping: 42 }}
                  />
                  <motion.span
                    layoutId="nav-capsule"
                    className="absolute left-0 top-3.5 h-4 w-[3px] rounded-full bg-violet"
                    transition={{ type: "spring", stiffness: 500, damping: 42 }}
                  />
                </>
              )}
              <Icon className="relative h-[19px] w-[19px] shrink-0" />
              <span className="relative hidden min-[1040px]:inline">{label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Playlists */}
      <div className="mt-9 hidden min-h-0 flex-1 flex-col overflow-y-auto px-3 min-[1040px]:flex">
        <p className="t-eyebrow px-[18px] pb-3">Playlists</p>
        <ul className="flex flex-col gap-0.5">
          {PLAYLISTS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelectPlaylist(p.leadTrackId)}
                className="group flex w-full items-center gap-3 rounded-xl px-[18px] py-2 text-left transition-colors hover:bg-white/[0.04]"
              >
                <div className="shrink-0 overflow-hidden rounded-lg">
                  <Artwork
                    hue={p.hue}
                    variant={p.art}
                    className="h-8 w-8 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <span className="truncate text-[13px] text-ink-2 transition-colors group-hover:text-ink">
                  {p.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="t-caption mt-auto hidden px-7 pb-6 pt-4 text-[11px] min-[1040px]:block">
        Preview build · mock data · no audio yet
      </p>
    </aside>
  );
}