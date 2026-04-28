"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  MathUtils,
  Object3D,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";

import { ExhibitLabel } from "@/components/dashboard/gallery/scene/ExhibitLabel";
import type { GalleryProject } from "@/components/dashboard/gallery/data/galleryProjects";

interface ExhibitPedestalProps {
  project: GalleryProject;
  position: [number, number, number];
  rotationY?: number;
  showLabel?: boolean;
  onSelect?: (projectId: string) => void;
}

export function ExhibitPedestal({
  project,
  position,
  rotationY = 0,
  showLabel = true,
  onSelect,
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
    for (let index = 0; index < project.id.length; index += 1) {
      hash = (hash * 31 + project.id.charCodeAt(index)) % 360;
    }
    return (hash * Math.PI) / 180;
  }, [project.id]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (group) {
      const floatOffset = Math.sin(state.clock.elapsedTime * 0.8 + floatSeed) * 0.05;
      group.position.y = position[1] + floatOffset;
    }

    const target = isHovered ? 1 : 0;
    hoverProgress.current = MathUtils.damp(hoverProgress.current, target, 6, delta);

    const ring = ringRef.current;
    if (ring) {
      const scale = 0.92 + hoverProgress.current * 0.16;
      ring.scale.set(scale, scale, scale);
    }

    const ringMaterial = ringMaterialRef.current;
    if (ringMaterial) {
      ringMaterial.emissiveIntensity = 0.45 + hoverProgress.current * 1.2;
      ringMaterial.opacity = 0.18 + hoverProgress.current * 0.5;
    }
  });

  const handlePointerEnter = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerLeave = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect?.(project.id);
  };

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.78, 0.94, 0.36, 32]} />
        <meshStandardMaterial color="#101010" roughness={0.68} metalness={0.2} />
      </mesh>

      <mesh
        ref={ringRef}
        position={[0, 0.02, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <torusGeometry args={[0.92, 0.035, 16, 64]} />
        <meshStandardMaterial
          ref={ringMaterialRef}
          color={accent}
          emissive={accent}
          emissiveIntensity={0.45}
          transparent
          opacity={0.18}
          roughness={0.35}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.86, 0.86, 0.12, 32]} />
        <meshStandardMaterial color="#171717" roughness={0.5} metalness={0.35} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.08, 0.16, 1.08]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.45} metalness={0.24} />
      </mesh>

      <mesh castShadow position={[0, 0.58, 0.62]} rotation={[Math.PI / 12, 0, 0]}>
        <boxGeometry args={[0.82, 0.22, 0.06]} />
        <meshStandardMaterial color="#111111" roughness={0.4} metalness={0.32} />
      </mesh>

      <mesh position={[0, 0.62, 0.64]} rotation={[Math.PI / 12, 0, 0]}>
        <boxGeometry args={[0.52, 0.05, 0.02]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.7}
          roughness={0.35}
          metalness={0.18}
        />
      </mesh>

      <mesh castShadow position={[0, 1.18, 0]}>
        <boxGeometry args={[1.08, 0.86, 0.08]} />
        <meshStandardMaterial
          color="#151515"
          emissive={accent}
          emissiveIntensity={0.22}
          roughness={0.32}
          metalness={0.12}
        />
      </mesh>

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

      <mesh
        position={[0, 0.95, 0]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[1.7, 2.1, 1.7]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <spotLight
        castShadow
        color={accent}
        intensity={1.45}
        angle={0.56}
        penumbra={0.45}
        distance={7}
        decay={1.9}
        position={[0, 3.1, 0]}
        target={spotlightTarget}
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.0002}
      />
      <primitive object={spotlightTarget} position={[0, 0.45, 0]} />
    </group>
  );
}
