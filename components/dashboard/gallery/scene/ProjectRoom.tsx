"use client";

import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, type MeshStandardMaterial } from "three";

import { GalleryEnvironment } from "./GalleryEnvironment";
import { ExhibitPedestal } from "./ExhibitPedestal";
import { getRoomPedestalPositions } from "./galleryLayout";
import type { GalleryProject, MuseumRoom } from "@/components/dashboard/gallery/data/galleryProjects";
import { roomMeta } from "@/components/dashboard/gallery/data/galleryProjects";

interface ProjectRoomProps {
  room: MuseumRoom;
  projects: GalleryProject[];
  onSelectProject: (id: string) => void;
  onExit: () => void;
}

export function ProjectRoom({ room, projects, onSelectProject, onExit }: ProjectRoomProps) {
  const meta = roomMeta[room];
  const positions = getRoomPedestalPositions(projects.length);

  return (
    <>
      <GalleryEnvironment />

      {/* Room title placard on back wall */}
      <Html center distanceFactor={9} position={[0, 7, -7.5]} transform>
        <div style={{ pointerEvents: "none", textAlign: "center", userSelect: "none" }}>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "11px",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: meta.color,
            textShadow: `0 0 16px ${meta.color}66`,
          }}>
            {meta.label}
          </p>
        </div>
      </Html>

      {/* Project pedestals */}
      {projects.map((project, i) => (
        <ExhibitPedestal
          key={project.id}
          project={project}
          position={positions[i]}
          onSelect={onSelectProject}
        />
      ))}

      {/* Exit door at the back — far enough from pedestals to be clickable */}
      <ExitDoor position={[0, 0, -6]} onExit={onExit} />
    </>
  );
}

export function ExitDoor({ position, onExit }: { position: [number, number, number]; onExit: () => void }) {
  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<MeshStandardMaterial>(null);
  const hoverProgress = useRef(0);

  useFrame((_, delta) => {
    hoverProgress.current = MathUtils.damp(hoverProgress.current, hovered ? 1 : 0, 6, delta);
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = 0.05 + hoverProgress.current * 0.35;
      glowRef.current.opacity = 0.3 + hoverProgress.current * 0.4;
    }
  });

  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handleLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onExit();
  };

  const [x, y, z] = position;

  return (
    <group position={[x, y, z]}>
      {/* Frame */}
      <mesh position={[-1.1, 2.6, 0]} castShadow>
        <boxGeometry args={[0.28, 5.4, 0.24]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.22} metalness={0.82} />
      </mesh>
      <mesh position={[1.1, 2.6, 0]} castShadow>
        <boxGeometry args={[0.28, 5.4, 0.24]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.22} metalness={0.82} />
      </mesh>
      <mesh position={[0, 5.4, 0]}>
        <boxGeometry args={[2.44, 0.2, 0.24]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.22} metalness={0.82} />
      </mesh>

      {/* Door panel */}
      <mesh
        position={[0, 2.6, 0.02]}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={[2.0, 5.2, 0.1]} />
        <meshStandardMaterial color="#120c06" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* Glow overlay */}
      <mesh position={[0, 2.6, 0.07]}>
        <boxGeometry args={[1.9, 5.1, 0.01]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#c9a84c"
          emissive="#c9a84c"
          emissiveIntensity={0.05}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Handle */}
      <mesh position={[0.72, 2.6, 0.1]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#d4a843" roughness={0.18} metalness={0.9} />
      </mesh>

      {/* EXIT label */}
      <Html center distanceFactor={8} position={[0, -0.6, 0.15]} transform>
        <div style={{ pointerEvents: "none", textAlign: "center", userSelect: "none" }}>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "10px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: hovered ? "#f0d080" : "#c9a84c",
            transition: "color 0.2s",
          }}>
            ← EXIT
          </p>
        </div>
      </Html>

      {/* Hit target */}
      <mesh
        position={[0, 2.6, 0.2]}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[2.4, 5.6, 0.3]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
