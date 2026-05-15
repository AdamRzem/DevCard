# Museum Redesign Plan — `gallery/3d`

## Context

Current 3D gallery (`components/dashboard/gallery/scene/*`) reads as a cyberpunk operator deck: matte-black hall, neon orange/green floor strips, mirror reflective floor, glowing holo-screens on every pedestal, mono `GALLERY_STATUS: ONLINE` chrome. AGENTS.md §1 calls the brand "High-End Personal Portfolio… digital museum" — exhibits should feel **curated**, not **patrolled**. Goal: pivot the 3D scene materials, lighting, pedestal silhouette, and signage to a **classical white-cube gallery** while keeping the existing HUD/minimap/camera systems intact (per user choice).

## Scope guardrails

- **In scope:** scene materials, lighting, pedestal geometry, exhibit-artwork rendering, room transitions, ambient atmosphere, accent palette.
- **Out of scope:** HUD layout, minimap component, camera rail logic, exhibit data model, fallback 2D path, mode toggle. (User: "Minimal HUD changes.")
- Files outside `components/dashboard/gallery/scene/` and `data/galleryProjects.ts` accent values should not be touched.

## Target aesthetic

White-cube gallery: bone-white walls (#f4efe6 ish), oak/walnut floor planks, brass picture-lights pointing down at framed wall artwork, marble plinths with engraved plaques. Warm tungsten key (~3200K), soft ambient skylight from above. Drop neon emissive accents and the mirror floor blur. Each project becomes a **framed canvas on the wall** above its plinth, plus a small object on the plinth — instead of a glowing holo-slab.

## Files to modify

### 1. `scene/GalleryEnvironment.tsx` — full rewrite of materials & lighting
- Replace `<color attach="background" args={["#050505"]}>` with `#1a1814` (deep warm charcoal — visible only outside walls / through fog).
- Replace `<fog>` color to `#e9e3d6` with farther falloff (e.g. `[14, 30]`) — soft daylight haze, not noir.
- Drop `MeshReflectorMaterial` floor. Replace with `meshStandardMaterial` color `#7a5a3b` roughness `0.65` metalness `0.05` — stained-oak parquet. Optionally add a `repeat`-tiled subtle plank texture later (defer until pass 2).
- Wall planes: color `#f1ebde` (gallery white), roughness `0.95`, metalness `0`. Raise wall height from 6 → 8 to feel cathedral.
- Ceiling: warm white `#f6f1e6` matte. Add small skylight cutouts (emissive plane patches) to motivate the ambient light.
- Replace `<ambientLight intensity={0.42}>` with `<hemisphereLight args={["#f8f1e0", "#3a2e1f", 0.55]} />` — sky/ground.
- Add a low-intensity `<directionalLight>` from above (sun via skylight) `intensity 0.4`, soft shadow.
- Delete the three `AccentStrip` boxes entirely (neon floor strips are not museum vocabulary).
- Add **doorway frames** between rooms: at the z-positions `galleryRoomMeta[room].z`, place arched portal geometry (two side jambs + lintel boxes) painted gallery white. This visually separates `MAIN_HALL → AI_WING → EXPERIMENTAL_LAB → ARCHIVE`.
- Add subtle **dust motes** ambient using `<Points>` from drei or 80–120 small `<sprite>` particles inside view frustum (defer to pass 2 if perf risk).

### 2. `scene/ExhibitPedestal.tsx` — reshape silhouette + relocate artwork
Current: cylindrical base + slab kiosk + emissive holo-screen at chest height. Reshape to:
- **Marble plinth**: square base `0.9 × 1.1 × 0.9`, color `#ece6d8` roughness `0.4` metalness `0.05`, optional faint vein normal map later. Top cap (slightly larger, `0.96 × 0.04 × 0.96`) for the brass plaque.
- **Brass plaque** on top front: `0.5 × 0.04 × 0.18`, color `#b08a4a` roughness `0.35` metalness `0.85`. Hosts the `ExhibitLabel` text (engraved look).
- **Object on plinth**: small accent-colored geometry (cube/sphere/icosa per project category) sitting on top, ~`0.3` size. Emissive replaced with subtle `accentColor` matte material.
- **Framed artwork on wall** behind pedestal: new `<group>` positioned at the nearest wall plane (use room z + wall side). Frame = brass-toned border `1.6 × 1.1 × 0.08`, inner canvas `1.4 × 0.9 × 0.02` rendered with the project's preview image (existing `project.image` / placeholder gradient). The current emissive holo-slab at `[0, 1.18, 0]` moves to the wall and loses its emissive intensity.
- **Picture light**: small brass arm + tungsten `spotLight` (color `#ffe2b5`, intensity `1.6`, angle `0.45`, decay `1.6`) mounted above the wall artwork pointing down at the canvas. Removes the current floor-up accent spotlight.
- Keep existing `useFrame` hover damp logic — but tone the ring to a **floor decal** (flat circle on floor in front of plinth) that brightens on hover instead of a halo around the plinth. Color: warm white `#fff4d8`, no neon accent.
- Hover cursor + click handler: unchanged.

### 3. `data/galleryProjects.ts`
- Re-tune each `accentColor` to a museum-friendly hue (muted ochre, sage, navy, terracotta) since accents now appear only on the small plinth-top object and decal — neon will look wrong against the bone palette. Quick swap, no schema change.

### 4. `scene/ExhibitLabel.tsx` (read first, then adjust)
- Current label likely renders mono uppercase floating text. Restyle to look like an engraved plaque caption: serif (e.g. `"Cormorant Garamond"` via `next/font/google` if not already), color `#2b2418`, no glow. Remove uppercase tracking.
- Drop the `exhibitNumber` `EXH-001` mono prefix; replace with quiet `"No. 01"` serif numeral.

### 5. `scene/GalleryScene.tsx`
- Tweak `<Canvas camera={{ position: [0, 4, 9.2], fov: 46 }}>` → fov `52`, position `[0, 1.7, 7]` for human-eye height. Rail waypoints in `GalleryCamera.tsx` already use `y: 1.75` so this is consistent.
- Adjust shadow setup unchanged.
- The header strip with `GALLERY_HALL // SHELL_ENVIRONMENT` overlay: keep (HUD scope minimal) but consider one-line text swap to `"Main Hall"` serif — leave as comment for follow-up.

### 6. `scene/galleryLayout.ts`
- Spread room z-spacing wider: `main-hall z 0`, `ai-wing z -8`, `experimental-lab z 8`, `archive z 14` so doorway portals have room to breathe and rooms feel like discrete spaces. Update `spacing` per room if needed for 2-3 exhibits per wall.
- Rotate exhibits to alternate **left-wall facing** and **right-wall facing** (`rotationY = ±Math.PI/2`) so framed artwork lands on the actual side walls. Update `buildRoomLayout` to assign positions along the wall, not center-aisle.

### 7. `scene/GalleryCamera.tsx` — minor
- Slow `camera.position.lerp(railTarget.current, 0.12)` → `0.06` for a more contemplative glide.
- Increase `OrbitControls` `minDistance` to `4` and lower `maxPolarAngle` cap so visitors can't tilt under the floor.

## Pedestal placement (visual sketch)

```
       [framed artwork on wall]
              |  picture light cone
              v
        ──────────         ← floor decal (hover ring)
        |        |
        | plinth |   ◆     ← small object on top
        |________|
         brass plaque
```

## Pass plan (sequencing)

1. **Pass 1 — palette & light**: rewrite `GalleryEnvironment.tsx`, retune `accentColor` values. Visual check: walls bone white, warm light, no neon. Skip dust motes.
2. **Pass 2 — pedestal + wall art**: rebuild `ExhibitPedestal.tsx`, relocate exhibit image to wall frame, add picture light. Visual check: each exhibit reads as plinth + framed canvas.
3. **Pass 3 — layout + portals**: update `galleryLayout.ts` (wall-facing positions, wider z-spacing), add doorway frames in environment.
4. **Pass 4 — typography**: restyle `ExhibitLabel.tsx` to serif plaque.
5. **Pass 5 — polish**: dust motes, plank texture, picture-light brass arms, slower camera glide.

Each pass is shippable in isolation; commit after each.

## Verification

- `npm run dev` → `http://localhost:3000/dashboard/gallery`.
- Check WebGL scene loads (no console errors), pedestals click into modal, minimap still mirrors positions.
- Walk through rail scroll: should pass through portal frames between rooms; lighting reads warm/diffuse not noir/neon.
- Toggle `MODE: FREE_ORBIT` → verify orbit clamp keeps camera above floor and outside walls.
- Force fallback: throttle GPU in DevTools → confirm `GalleryFallback` still triggers (untouched code path).
- `npm run lint` clean.

## Open follow-ups (not in this plan)

- Picture-frame canvas image source: requires real `project.image` field on `GalleryProject` — currently absent; placeholder gradient acceptable for pass 2.
- Audio-guide stub (footstep / room ambience) — defer.
- HUD restyling to museum signage — explicitly out of scope per user.
