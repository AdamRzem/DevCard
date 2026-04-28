"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { PCFSoftShadowMap } from "three";

import {
  galleryProjects,
  type GalleryProject,
  type GalleryRoom,
} from "@/components/dashboard/gallery/data/galleryProjects";
import { ExhibitPedestal } from "@/components/dashboard/gallery/scene/ExhibitPedestal";
import { GalleryEnvironment } from "@/components/dashboard/gallery/scene/GalleryEnvironment";
type ExhibitLayoutItem = {
  project: GalleryProject;
  position: [number, number, number];
  rotationY: number;
};

type GallerySceneProps = {
  onSelectExhibit?: (id: string) => void;
};

const roomOrder: GalleryRoom[] = [
  "main-hall",
  "ai-wing",
  "experimental-lab",
  "archive",
];

const roomLayout: Record<GalleryRoom, { z: number; spacing: number }> = {
  "main-hall": { z: 0, spacing: 3.6 },
  "ai-wing": { z: -5.8, spacing: 2.8 },
  "experimental-lab": { z: 5.8, spacing: 2.8 },
  archive: { z: 8.6, spacing: 2.6 },
};

function buildRoomLayout(
  projects: GalleryProject[],
  room: GalleryRoom,
): ExhibitLayoutItem[] {
  if (projects.length === 0) {
    return [];
  }

  const config = roomLayout[room];
  const startX = -((projects.length - 1) * config.spacing) / 2;

  return projects.map((project, index) => ({
    project,
    position: [startX + index * config.spacing, 0, config.z],
    rotationY: 0,
  }));
}

function buildGalleryLayout(projects: GalleryProject[]): ExhibitLayoutItem[] {
  return roomOrder.flatMap((room) =>
    buildRoomLayout(
      projects.filter((project) => project.room === room),
      room,
    ),
  );
}

function GallerySceneShell({
  items,
  onSelectExhibit,
}: {
  items: ExhibitLayoutItem[];
  onSelectExhibit?: (id: string) => void;
}) {
  return (
    <>
      <GalleryEnvironment />
      {items.map((item) => (
        <ExhibitPedestal
          key={item.project.id}
          project={item.project}
          position={item.position}
          rotationY={item.rotationY}
          onSelect={onSelectExhibit}
        />
      ))}
      <OrbitControls
        enablePan={false}
        minDistance={5.4}
        maxDistance={13.5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export function GalleryScene({ onSelectExhibit }: GallerySceneProps) {
  return (
    <section className="hud-panel relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-[linear-gradient(180deg,rgba(5,5,5,0.84),transparent)]" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            GALLERY_HALL
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            ORBIT // SHELL_ENVIRONMENT
          </p>
        </div>
      </header>

      <div className="h-[360px] sm:h-[420px] lg:h-[520px]">
        <Canvas
          camera={{ position: [0, 4, 9.2], fov: 46 }}
          dpr={[1, 1.5]}
          shadows={{ type: PCFSoftShadowMap }}
        >
          <GallerySceneShell
            items={buildGalleryLayout(galleryProjects)}
            onSelectExhibit={onSelectExhibit}
          />
        </Canvas>
      </div>
    </section>
  );
}
