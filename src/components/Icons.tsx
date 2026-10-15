import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const line = (p: IconProps): IconProps => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...p,
});

const solid = (p: IconProps): IconProps =>
  line({ ...p, fill: "currentColor", stroke: "none" });

export const SonicMark = (p: IconProps) => (
  <svg {...solid(p)}>
    <rect x="2" y="9" width="3.2" height="6" rx="1.6" />
    <rect x="7.2" y="4" width="3.2" height="16" rx="1.6" />
    <rect x="12.4" y="7" width="3.2" height="10" rx="1.6" />
    <rect x="17.6" y="10" width="3.2" height="4" rx="1.6" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const LibraryIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <rect x="3" y="4" width="4" height="16" rx="1" />
    <rect x="9" y="4" width="4" height="16" rx="1" />
    <path d="m15.5 5.5 4 14" />
  </svg>
);

export const MusicIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const FolderIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...solid(p)}>
    <path d="M7 4.5v15a.5.5 0 0 0 .77.42l12-7.5a.5.5 0 0 0 0-.84l-12-7.5A.5.5 0 0 0 7 4.5z" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <svg {...solid(p)}>
    <rect x="6" y="4" width="4" height="16" rx="1.2" />
    <rect x="14" y="4" width="4" height="16" rx="1.2" />
  </svg>
);

export const PrevIcon = (p: IconProps) => (
  <svg {...solid(p)}>
    <rect x="5" y="5" width="2.5" height="14" rx="1.2" />
    <path d="M19 6.2v11.6a.6.6 0 0 1-.93.5L9.4 12.5a.6.6 0 0 1 0-1l8.67-5.8a.6.6 0 0 1 .93.5z" />
  </svg>
);

export const NextIcon = (p: IconProps) => (
  <svg {...solid(p)}>
    <rect x="16.5" y="5" width="2.5" height="14" rx="1.2" />
    <path d="M5 6.2v11.6a.6.6 0 0 0 .93.5l8.67-5.8a.6.6 0 0 0 0-1L5.93 5.7A.6.6 0 0 0 5 6.2z" />
  </svg>
);

export const ShuffleIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
    <path d="m18 2 4 4-4 4" />
    <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
    <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
    <path d="m18 14 4 4-4 4" />
  </svg>
);

export const RepeatIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export const VolumeIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </svg>
);

export const QueueIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M3 6h18M3 12h18M3 18h9" />
    <path d="m16 15 5 3-5 3z" fill="currentColor" />
  </svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <svg {...line(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);