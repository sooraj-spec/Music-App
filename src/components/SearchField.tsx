import { useRef } from "react";
import { SearchIcon } from "./Icons";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Called when Enter is pressed. */
  onSubmit: () => void;
  placeholder?: string;
}

export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = "Search tracks, artists, albums, playlists",
}: SearchFieldProps) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="glass flex h-14 items-center gap-3 rounded-full px-5 transition-colors focus-within:border-violet/60">
      <SearchIcon className="h-5 w-5 shrink-0 text-ink-3" />
      <input
        ref={ref}
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape" && value) {
            e.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label="Search"
        spellCheck={false}
        autoComplete="off"
        className="min-w-0 flex-1 select-text bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.08] hover:text-ink"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      )}
    </div>
  );
}