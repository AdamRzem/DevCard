"use client";

import { Canvas } from "@react-three/fiber";
import { PCFSoftShadowMap } from "three";

import { GalleryEnvironment } from "./GalleryEnvironment";
import { GalleryCamera } from "./GalleryCamera";
import { MuseumDoor } from "./MuseumDoor";
import { ProjectRoom } from "./ProjectRoom";
import { GithubStatsRoom } from "./GithubStatsRoom";
import { DOOR_POSITIONS, HALL_CAMERA } from "./galleryLayout";
import type { MuseumView } from "./galleryLayout";
import { galleryProjects, roomMeta, type MuseumRoom } from "@/components/dashboard/gallery/data/galleryProjects";

interface GallerySceneProps {
  view: MuseumView;
  onEnterRoom: (room: MuseumRoom) => void;
  onExitRoom: () => void;
  onSelectProject: (id: string) => void;
}

export function GalleryScene({ view, onEnterRoom, onExitRoom, onSelectProject }: GallerySceneProps) {
  const rooms: MuseumRoom[] = ["web", "mobile", "github-stats"];

  const roomProjects = view !== "hall"
    ? galleryProjects.filter((p) => p.room === view)
    : [];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Canvas
        camera={{ position: HALL_CAMERA.position, fov: 52 }}
        dpr={[1, 1.5]}
        shadows={{ type: PCFSoftShadowMap }}
        gl={{ antialias: true }}
      >
        <GalleryCamera view={view} />

        {view === "hall" ? (
          <>
            <GalleryEnvironment />
            {rooms.map((room) => (
              <MuseumDoor
                key={room}
                position={DOOR_POSITIONS[room]}
                label={roomMeta[room].doorLabel}
                color={roomMeta[room].color}
                onClick={() => onEnterRoom(room)}
              />
            ))}
          </>
        ) : view === "github-stats" ? (
          <GithubStatsRoom onExit={onExitRoom} />
        ) : (
          <ProjectRoom
            room={view}
            projects={roomProjects}
            onSelectProject={onSelectProject}
            onExit={onExitRoom}
          />
        )}
      </Canvas>

      {/* Room label overlay */}
      {view !== "hall" && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: roomMeta[view].color,
            }}
          >
            {roomMeta[view].label}
          </p>
        </div>
      )}

      {/* Hall instruction overlay */}
      {view === "hall" && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#c9a84c] opacity-70">
            Click a door to enter
          </p>
        </div>
      )}

      {/* DOM back button — always clickable regardless of 3D raycaster */}
      {view !== "hall" && (
        <button
          type="button"
          onClick={onExitRoom}
          className="absolute left-4 top-4 z-20 border border-[#c9a84c44] bg-[rgba(20,14,6,0.72)] px-3 py-1.5 transition-colors duration-150 hover:border-[#c9a84c] hover:bg-[rgba(30,20,8,0.88)]"
          style={{ fontFamily: "Georgia, serif", fontSize: "11px", letterSpacing: "0.22em", color: "#c9a84c", textTransform: "uppercase" }}
        >
          ← Hall
        </button>
      )}
    </div>
  );
}
