"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { MathUtils, Object3D, type Group, type Mesh, type MeshStandardMaterial } from "three";

import { ExhibitLabel } from "@/components/dashboard/gallery/scene/ExhibitLabel";
import type { GalleryProject } from "@/components/dashboard/gallery/data/galleryProjects";

interface ExhibitPedestalProps {
  project: GalleryProject;
  position: [number, number, number];
  rotationY?: number;
  showLabel?: boolean;
  onSelect?: (projectId: string) => void;
  onHoverChange?: (projectId: string | null) => void;
}

export function ExhibitPedestal({
  project,
  position,
  rotationY = 0,
  showLabel = true,
  onSelect,
  onHoverChange,
}: ExhibitPedestalProps) {
  const accent = project.accentColor;
  const spotlightTarget = useMemo(() => new Object3D(), []);
  const groupRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const ringMaterialRef = useRef<MeshStandardMaterial>(null);
  const hoverProgress = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const floatSeed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < project.id.length; i++) {
      hash = (hash * 31 + project.id.charCodeAt(i)) % 360;
    }
    return (hash * Math.PI) / 180;
  }, [project.id]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      const floatOffset = Math.sin(state.clock.elapsedTime * 0.8 + floatSeed) * 0.04;
      groupRef.current.position.y = position[1] + floatOffset;
    }

    const target = isHovered ? 1 : 0;
    hoverProgress.current = MathUtils.damp(hoverProgress.current, target, 6, delta);

    if (ringRef.current) {
      const scale = 0.92 + hoverProgress.current * 0.16;
      ringRef.current.scale.set(scale, scale, scale);
    }
    if (ringMaterialRef.current) {
      ringMaterialRef.current.emissiveIntensity = 0.35 + hoverProgress.current * 1.1;
      ringMaterialRef.current.opacity = 0.15 + hoverProgress.current * 0.55;
    }
  });

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
    onHoverChange?.(project.id);
  };

  const handlePointerLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
    onHoverChange?.(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(project.id);
  };

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      {/* Base — cream marble */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.78, 0.94, 0.36, 32]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.45} metalness={0.06} />
      </mesh>

      {/* Gold accent ring */}
      <mesh ref={ringRef} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={3}>
        <torusGeometry args={[0.92, 0.035, 16, 64]} />
        <meshStandardMaterial
          ref={ringMaterialRef}
          color="#c9a84c"
          emissive="#c9a84c"
          emissiveIntensity={0.35}
          transparent
          opacity={0.15}
          roughness={0.18}
          metalness={0.85}
          depthWrite={false}
        />
      </mesh>

      {/* Gold band collar */}
      <mesh castShadow receiveShadow position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.86, 0.86, 0.12, 32]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Shaft cap — marble */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.08, 0.16, 1.08]} />
        <meshStandardMaterial color="#e0d5b8" roughness={0.5} metalness={0.04} />
      </mesh>

      {/* Placard holder — dark wood */}
      <mesh castShadow position={[0, 0.58, 0.62]} rotation={[Math.PI / 12, 0, 0]}>
        <boxGeometry args={[0.82, 0.22, 0.06]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.55} metalness={0.1} />
      </mesh>

      {/* Placard gold stripe */}
      <mesh position={[0, 0.62, 0.64]} rotation={[Math.PI / 12, 0, 0]}>
        <boxGeometry args={[0.52, 0.05, 0.02]} />
        <meshStandardMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.7} roughness={0.18} metalness={0.85} />
      </mesh>

      {/* Display panel */}
      <mesh castShadow position={[0, 1.18, 0]}>
        <boxGeometry args={[1.08, 0.86, 0.08]} />
        <meshStandardMaterial color="#1a1208" emissive={accent} emissiveIntensity={0.18} roughness={0.38} metalness={0.12} />
      </mesh>

      {/* Display glow */}
      <mesh position={[0, 1.18, 0.05]}>
        <boxGeometry args={[1, 0.78, 0.03]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.75}
          transparent
          opacity={0.55}
          roughness={0.25}
          metalness={0.08}
          depthWrite={false}
        />
      </mesh>

      {showLabel ? (
        <ExhibitLabel
          exhibitNumber={project.exhibitNumber}
          codeName={project.codeName}
          title={project.title}
          accentColor={accent}
          award={project.award}
        />
      ) : null}

      {/* Invisible hit target */}
      <mesh position={[0, 0.95, 0]} onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave} onClick={handleClick}>
        <boxGeometry args={[1.7, 2.1, 1.7]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Spotlight */}
      <spotLight
        castShadow
        color={accent}
        intensity={1.6}
        angle={0.52}
        penumbra={0.5}
        distance={7}
        decay={1.8}
        position={[0, 3.2, 0]}
        target={spotlightTarget}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0002}
      />
      <primitive object={spotlightTarget} position={[0, 0.45, 0]} />
    </group>
  );
}
