# Sonic: Project Plan and Progress

**Project:** Premium Windows desktop music player
**Location:** C:\Users\SOORAJ\OneDrive\Desktop\Sonic\sonic
**Stack:** Tauri 2, React 19, TypeScript, Vite, Tailwind CSS v4 (@tailwindcss/vite), Motion for React (`motion/react`), DM Sans (@fontsource-variable/dm-sans)
**Identifier:** com.sonic.player
**Terminal:** VS Code PowerShell (execution policy set to RemoteSigned for current user)
**GitHub repo:** <paste your repo URL here>
**Figma:** https://www.figma.com/design/9aMf9gKscg014kA9dmIylg
(The old Figma design is superseded by the Ambient Glass brief. Claude can read Figma only when the Figma connector is enabled in that chat, and the free plan has a tool-call limit. Screenshots always work.)

## Working method
- Free Claude website, no Claude Code. Code is copied manually into VS Code.
- Small batches. Every file is given with its exact path, marked NEW or REPLACES, with complete contents.
- Terminal commands are given separately with the directory to run them in.
- Claude has not run any code; I run it and report errors.
- Claude should not ask for files it wrote earlier in the conversation, only for files I changed myself.

## Repo rules
- Claude cannot access GitHub or remember past chats. I paste any files Claude needs to see, and paste this file into every new chat.
- Always build on the existing repo's current code. Never recreate or overwrite the project.
- Work on branch `ambient-glass`; `main` stays the last working version.
- Commit after each verified batch.

## Design direction: Sonic 2.0 "Ambient Glass"
Premium glassmorphism meets immersive music editorial. Near-black foundations, translucent glass panels with controlled blur and thin low-contrast borders, restrained violet accent, secondary colors drawn from album artwork. No neon, no glowing borders, no nested glass. Do not animate backdrop blur. Respect reduced motion.

## Design system (src/index.css)
- Colors: void #07070a, ink #f3f1f8, ink-2 #b5b2c4, ink-3 #7b788b, violet #9479f5, violet-soft rgba(148,121,245,0.16), hairline rgba(255,255,255,0.07)
- Font: DM Sans Variable
- Glass: `.glass` (sidebar, cards) and `.glass-float` (floating player, queue drawer). One level only.
- Type classes: `.t-display`, `.t-headline`, `.t-title`, `.t-body`, `.t-caption`, `.t-eyebrow`
- Cover art is procedural (Artwork.tsx, variants orb / horizon / rings / prism)
- The page background tints from the current track's hue (Ambient.tsx; `strong` variant behind Now Playing)

## Player architecture (all UI-only mock, NO audio)
- All player state lives in App.tsx and is passed down as one `player: PlayerApi` object (defined in types.ts).
- State: track, isPlaying, progress (0-1), volume (0-1), shuffle, repeat, liked set, and `order` (play order: normal, or a shuffled copy with the current track first while shuffle is on).
- Queue, Next and Prev all use the same `order`, so they always match.
- Next on the last track: wraps if repeat is on, otherwise stops playback. Prev restarts the track if progress is over 5%, otherwise goes back.
- Mini-player and Now Playing share the cover through a Motion `layoutId="player-art"` transition.
- Now Playing is an overlay (not a screen). The app behind it is `inert`. Esc closes the queue first, then Now Playing. Clicking outside the queue also closes it.

## Current file structure
sonic/
- index.html, package.json, vite.config.ts (unchanged from Phase 1)
- src/
  - main.tsx (imports DM Sans and ./index.css)
  - App.tsx (player state, navigation, layout, Ambient, Now Playing overlay)
  - index.css, types.ts (Screen, Track, Collection, FeaturedMix, PlayerApi)
  - lib/ motion.ts, format.ts (toSeconds, formatTime, mockElapsed), waveform.ts
  - data/mock.ts (MOCK tracks, featured mix, discover, playlists)
  - components/ Icons, Artwork, EmptyState, ComingSoon, Sidebar, MiniPlayer, NowPlaying, Ambient, IconButton, PlayButton, Slider, Waveform
  - screens/ Home
- src-tauri/ (unchanged; tauri.conf.json: productName Sonic, 1280x800, min 960x600, dark)

## Phases
- [x] Phase 1: Foundation, dark theme, Motion, running Tauri window (verified)
- [~] Phase 2: Ambient Glass redesign
  - [x] Batch A: design system, sidebar, Home (in use; running with Batch B)
  - [~] Batch B: full mini-player, artwork transition, Now Playing, waveform, queue drawer, volume, shuffle/repeat/like (tested by me; two issues found, fixes delivered, awaiting retest)
    - Fixed: shuffle now reorders the queue (single shared `order`)
    - Fixed: clicking outside the queue closes it
  - [ ] Batch C: Search and Library redesign (currently placeholders via ComingSoon). Must use existing mock data, shared player state and existing components.
- [ ] Phase 3: Remaining screens polish and Liked Songs (mock data)
- [ ] Phase 4: Queue UI wired to a real queue model
- [ ] Phase 5: Local music playback (Rust file scanning, audio, metadata, artwork). NO audio exists yet.
- [ ] Phase 6: Polish, animations, packaging
- [ ] Later: Online discovery via authorized providers

## Commands
Run from the project folder (the one containing package.json):
- Start app: npm run tauri dev
- Stop app: Ctrl+C
- Type check: npx tsc --noEmit
- Diagnostics: npm run tauri info

## Known issues and fixes
- "npm.ps1 cannot be loaded": run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt.
- Import errors: main.tsx must say `import "./index.css";` and index.css must be inside src.
- Port 1420 in use: end old node.exe processes in Task Manager.
- The project is inside OneDrive. If odd file-lock or build errors appear, move it to a simple path like C:\Dev\sonic.
- Shared artwork transition (layoutId) is the part most likely to need tuning if it looks jumpy.

## Next step
Retest the two Batch B fixes (shuffle queue order, click-outside to close the queue), commit, then start Batch C.

## Notes for the next chat
Paste this whole file and say "Start Batch C" (or report any Batch B errors). Playback, progress, volume and track state are UI-only mock; do not claim audio works.