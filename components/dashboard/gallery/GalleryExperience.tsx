"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { GalleryFallback } from "@/components/dashboard/gallery/fallback/GalleryFallback";
import { ExhibitModal } from "@/components/dashboard/gallery/hud/ExhibitModal";
import { GalleryScene } from "@/components/dashboard/gallery/scene/GalleryScene";
import { galleryProjects, type MuseumRoom } from "@/components/dashboard/gallery/data/galleryProjects";
import type { MuseumView } from "@/components/dashboard/gallery/scene/galleryLayout";

function canRenderWebGL2() {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2"));
}

function isLowCoreDevice() {
  if (typeof navigator === "undefined") return false;
  return (navigator.hardwareConcurrency ?? 4) <= 2;
}

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function GalleryExperience() {
  const hasHydrated = useHasHydrated();
  const [view, setView] = useState<MuseumView>("hall");
  const [transitioning, setTransitioning] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const useFallback = useMemo(() => {
    if (!hasHydrated) return null;
    return !canRenderWebGL2() || isLowCoreDevice();
  }, [hasHydrated]);

  const selectedProject = useMemo(
    () => galleryProjects.find((p) => p.id === selectedProjectId) ?? null,
    [selectedProjectId],
  );

  const navigate = (nextView: MuseumView) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setView(nextView);
      setTimeout(() => setTransitioning(false), 50);
    }, 420);
  };

  const handleEnterRoom = (room: MuseumRoom) => navigate(room);
  const handleExitRoom = () => navigate("hall");

  return (
    <section className="relative h-full">
      {useFallback === null ? (
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#c9a84c] opacity-60">
            Initialising gallery…
          </p>
        </div>
      ) : useFallback ? (
        <GalleryFallback />
      ) : (
        <div className="relative">
          {/* Fade overlay for room transitions */}
          <div
            className="pointer-events-none absolute inset-0 z-30 bg-black transition-opacity duration-[420ms]"
            style={{ opacity: transitioning ? 1 : 0 }}
          />

          <GalleryScene
            view={view}
            onEnterRoom={handleEnterRoom}
            onExitRoom={handleExitRoom}
            onSelectProject={setSelectedProjectId}
          />
        </div>
      )}

      {selectedProject ? (
        <ExhibitModal project={selectedProject} onClose={() => setSelectedProjectId(null)} />
      ) : null}
    </section>
  );
}
