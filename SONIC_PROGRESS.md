# Sonic: Project Plan and Progress

**Project:** Premium Windows desktop music player
**Location:** C:\Users\SOORAJ\OneDrive\Desktop\Sonic\sonic
**Stack:** Tauri 2, React, TypeScript, Vite, Tailwind CSS v4 (@tailwindcss/vite), Motion for React (`motion/react`)
**Identifier:** com.sonic.player
**Terminal:** VS Code PowerShell (execution policy set to RemoteSigned for current user)
**Figma:** https://www.figma.com/design/9aMf9gKscg014kA9dmIylg
(Claude cannot read Figma links. Share screenshots or exported frames.)

## Working method
- Free Claude website, no Claude Code. Code is copied manually into VS Code.
- Small phases. Every file is given with its exact path, marked NEW or REPLACES, with complete contents.
- Terminal commands are given separately with the directory to run them in.
- Claude has not run any code; I run it and report errors.

## Design goals
- Premium dark interface with restrained violet accents
- Beautiful album artwork and typography
- Sidebar, Home, Search, Library, mini-player, expanded Now Playing, queue
- Smooth, polished animations
- Real local music playback is the core feature
- Online discovery later, through authorized providers only

## Design tokens (src/index.css, placeholders until Figma is shared)
- base #0a0a0f
- surface #111117
- elevated #181820
- line rgba(255,255,255,0.07)
- ink #f4f4f7
- muted #8b8b99
- accent (violet) #8b5cf6
- accent-soft rgba(139,92,246,0.14)
- Fonts: Segoe UI Variable (text and display), system fallbacks

## Current file structure
sonic/
- index.html (title "Sonic")
- package.json
- vite.config.ts (react + tailwindcss plugins, port 1420)
- src/
  - main.tsx (imports ./index.css)
  - App.tsx (grid layout: sidebar, main, mini-player placeholder; Tauri bridge status chip)
  - index.css (Tailwind import and @theme tokens)
  - assets/
  - vite-env.d.ts
- src-tauri/
  - tauri.conf.json (productName Sonic, 1280x800, min 960x600, dark theme)
  - Cargo.toml, src/, icons/

## Phases
- [x] Phase 1: Foundation, dark theme, Motion, running Tauri window (verified working)
- [~] Phase 2 (Sonic 2.0 "Ambient Glass" redesign):
  - [x] Batch A: design system, sidebar, Home, basic floating mini-player (verify)
  - [ ] Batch B: full mini-player, expand transition, Now Playing (artwork centerpiece, waveform, queue, volume)
  - [ ] Batch C: Search and Library redesign
- [ ] Phase 3: Home, Search, Library screens (mock data)
- [ ] Phase 4: Expanded Now Playing and queue UI
- [ ] Phase 5: Local music playback (Rust file scanning, audio, metadata, artwork)
- [ ] Phase 6: Polish, animations, packaging
- [ ] Later: Online discovery via authorized providers

## Commands
Run from the project folder (the one containing package.json):
- Start app: npm run tauri dev
- Stop app: Ctrl+C
- Diagnostics: npm run tauri info

## Known issues and fixes
- "npm.ps1 cannot be loaded": run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt.
- Import errors: main.tsx must say `import "./index.css";` and index.css must be inside src.
- Port 1420 in use: end old node.exe processes in Task Manager.
- Project is inside OneDrive and the folder path has spaces/parentheses in some earlier runs. If odd file-lock or build errors appear, move the project to a simple path like C:\Dev\sonic.

## Next step
Start Phase 2. Needed from Figma (screenshots): full layout, Home, Search, Library, Now Playing, queue, plus any color/font/spacing notes.

## Notes for the next chat
Paste this whole file, attach the Figma screenshots, and say "Start Phase 2".
Design: glass utilities (.glass, .glass-float) and type classes (.t-display, .t-headline, .t-title, .t-body, .t-caption, .t-eyebrow) live in src/index.css. Glass is one level only. Cover art is procedural (Artwork.tsx, variants orb/horizon/rings/prism). The old Figma design was superseded.