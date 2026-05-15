# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

No test runner is configured; there are no unit/integration tests in this repo.

## Active work (branch: gallery/3d)

The 3D Museum gallery is the current focus. Relevant code:

- `app/dashboard/gallery/page.tsx` — route entry
- `components/dashboard/gallery/GalleryExperience.tsx` — top-level wrapper that switches between 3D scene and 2D fallback
- `components/dashboard/gallery/scene/` — R3F scene (`GalleryScene`, `GalleryCamera`, `GalleryEnvironment`, `ExhibitPedestal`, `ExhibitLabel`) and shared `galleryLayout.ts`
- `components/dashboard/gallery/hud/` — DOM overlay (`GalleryHUD`, `GalleryMinimap`, `ExhibitModal`)
- `components/dashboard/gallery/fallback/GalleryFallback.tsx` — non-WebGL path

R3F/drei are pinned at v9/v10 with three ^0.183 — newer than the versions AGENTS.md §3 lists. Trust `package.json`, not the table.

## Architecture quick map (beyond AGENTS.md)

- `app/dashboard/{web,mobile,stats,gallery}/page.tsx` are the four "rooms" of the portfolio dashboard, each rendering a different exhibit cluster.
- `app/[slug]/page.tsx` is the public, unauthenticated portfolio route — never gate it behind `auth()`.
- `app/api/github/sync/route.ts` and `app/api/card/[slug]/route.ts` are the only mutation endpoints; both use the service-role Supabase client from `lib/supabase/client.ts`.
- All client-only code (R3F, framer-motion, anything using `useState`/`useEffect`) needs `"use client"`. Server Components remain the default per AGENTS.md §19.

## Environment notes

- Windows + PowerShell. Use `$env:VAR`, not `$VAR`; chain with `;` + `if ($?)`, not `&&`.
- This is **Next.js 16** with App Router — APIs differ from training data. Per AGENTS.md, consult `node_modules/next/dist/docs/` before writing Next-specific code.
- Tailwind **v4** (PostCSS plugin); v3 syntax (`@tailwind base;` etc.) does not apply.
- Auth.js **v5 beta** — use `auth()`, not `getServerSession()`.
