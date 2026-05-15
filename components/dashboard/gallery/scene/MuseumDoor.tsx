"use client";

import { Html } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, type Mesh, type MeshStandardMaterial } from "three";

interface MuseumDoorProps {
  position: [number, number, number];
  label: string;
  color: string;
  onClick: () => void;
}

export function MuseumDoor({ position, label, color, onClick }: MuseumDoorProps) {
  const [hovered, setIsHovered] = useState(false);
  const glowRef = useRef<MeshStandardMaterial>(null);
  const doorRef = useRef<Mesh>(null);
  const hoverProgress = useRef(0);

  useFrame((_, delta) => {
    hoverProgress.current = MathUtils.damp(hoverProgress.current, hovered ? 1 : 0, 6, delta);

    if (glowRef.current) {
      glowRef.current.emissiveIntensity = 0.1 + hoverProgress.current * 0.6;
      glowRef.current.opacity = 0.55 + hoverProgress.current * 0.35;
    }
    if (doorRef.current) {
      doorRef.current.position.z = position[2] + 0.01 + hoverProgress.current * 0.04;
    }
  });

  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handleLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  const [x, y, z] = position;
  const W = 2.6;
  const H = 4.8;
  const archR = W / 2;

  return (
    <group position={[x, y, z]}>
      {/* Door frame — left pillar */}
      <mesh position={[-W / 2 - 0.18, H / 2 - 0.2, 0]} castShadow>
        <boxGeometry args={[0.36, H - 0.4, 0.32]} />
        <meshStandardMaterial color="#c9b07a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Door frame — right pillar */}
      <mesh position={[W / 2 + 0.18, H / 2 - 0.2, 0]} castShadow>
        <boxGeometry args={[0.36, H - 0.4, 0.32]} />
        <meshStandardMaterial color="#c9b07a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Door frame — arch top segments (approximated with boxes) */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((offset, i) => {
        const angle = (offset / archR) * (Math.PI / 2);
        const ax = Math.sin(angle) * archR;
        const ay = H - archR + Math.cos(angle) * archR;
        return (
          <mesh key={i} position={[ax, ay, 0]} rotation={[0, 0, -angle]} castShadow>
            <boxGeometry args={[0.36, 0.48, 0.32]} />
            <meshStandardMaterial color="#c9b07a" roughness={0.3} metalness={0.7} />
          </mesh>
        );
      })}

      {/* Lintel — horizontal bar above rectangular part */}
      <mesh position={[0, H - archR, 0]} castShadow>
        <boxGeometry args={[W + 0.36, 0.2, 0.32]} />
        <meshStandardMaterial color="#c9b07a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Door panel — dark wood */}
      <mesh
        ref={doorRef}
        position={[0, H / 2 - 0.5, 0.02]}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        castShadow
      >
        <boxGeometry args={[W, H - 1, 0.12]} />
        <meshStandardMaterial color="#1a1008" roughness={0.55} metalness={0.08} />
      </mesh>

      {/* Door panel — glowing overlay on hover */}
      <mesh position={[0, H / 2 - 0.5, 0.08]}>
        <boxGeometry args={[W - 0.1, H - 1.1, 0.01]} />
        <meshStandardMaterial
          ref={glowRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          transparent
          opacity={0.55}
          depthWrite={false}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Door handle — gold knob */}
      <mesh position={[W / 2 - 0.36, H / 2 - 0.5, 0.12]} castShadow>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#d4a843" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Label */}
      <Html center distanceFactor={10} position={[0, -0.7, 0.2]} transform>
        <div
          style={{
            pointerEvents: "none",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          <p
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "13px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: hovered ? color : "#c9b07a",
              transition: "color 0.2s",
              textShadow: hovered ? `0 0 12px ${color}88` : "none",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </p>
        </div>
      </Html>

      {/* Invisible hit target for full door area */}
      <mesh
        position={[0, H / 2 - 0.5, 0.15]}
        onPointerEnter={handleEnter}
        onPointerLeave={handleLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[W + 0.4, H, 0.3]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Spotlight above door */}
      <spotLight
        color={color}
        intensity={hovered ? 2.5 : 1.2}
        angle={0.5}
        penumbra={0.6}
        distance={9}
        decay={1.8}
        position={[0, 7.5, 1.5]}
        target-position={[x, 2, z]}
        castShadow={false}
      />
    </group>
  );
}
