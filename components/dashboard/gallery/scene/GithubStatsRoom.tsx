"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { MathUtils, type MeshStandardMaterial } from "three";

import { GalleryEnvironment } from "./GalleryEnvironment";
import { ExitDoor } from "./ProjectRoom";
import { roomMeta } from "@/components/dashboard/gallery/data/galleryProjects";

const LANGUAGES = [
  { name: "TypeScript", pct: 45, color: "#4f8ef0" },
  { name: "JavaScript", pct: 22, color: "#e8c840" },
  { name: "Python", pct: 18, color: "#5a9fd4" },
  { name: "CSS", pct: 10, color: "#9b6dda" },
  { name: "HTML", pct: 5, color: "#e05a30" },
];

const KEY_STATS = [
  { label: "COMMITS", value: "1,247" },
  { label: "STARS", value: "89" },
  { label: "REPOS", value: "23" },
  { label: "STREAK", value: "42 days" },
];

const MAX_PCT = 45;
const MAX_HEIGHT = 5.5;
const TOWER_POSITIONS: [number, number, number][] = [
  [-5.5, 0, -1],
  [-2.75, 0, -1],
  [0, 0, -1],
  [2.75, 0, -1],
  [5.5, 0, -1],
];

interface LanguageTowerProps {
  name: string;
  pct: number;
  color: string;
  position: [number, number, number];
}

function LanguageTower({ name, pct, color, position }: LanguageTowerProps) {
  const h = (pct / MAX_PCT) * MAX_HEIGHT;
  const [hovered, setHovered] = useState(false);
  const matRef = useRef<MeshStandardMaterial>(null);
  const glow = useRef(0);

  useFrame((_, delta) => {
    glow.current = MathUtils.damp(glow.current, hovered ? 1 : 0, 6, delta);
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.2 + glow.current * 0.55;
    }
  });

  return (
    <group position={position}>
      {/* Gold base plate */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.3, 0.24, 1.3]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Tower body */}
      <mesh
        position={[0, 0.24 + h / 2, 0]}
        onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "default"; }}
        onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); }}
      >
        <boxGeometry args={[0.9, h, 0.9]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.35}
          metalness={0.08}
        />
      </mesh>

      {/* Gold cap */}
      <mesh position={[0, 0.24 + h + 0.1, 0]}>
        <boxGeometry args={[1.05, 0.2, 1.05]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Label */}
      <Html center distanceFactor={9} position={[0, -0.75, 0]} transform>
        <div style={{ pointerEvents: "none", textAlign: "center", userSelect: "none", minWidth: "72px" }}>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "8px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c9a84c",
          }}>
            {name}
          </p>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "13px",
            color,
            marginTop: "3px",
          }}>
            {pct}%
          </p>
        </div>
      </Html>
    </group>
  );
}

interface GithubStatsRoomProps {
  onExit: () => void;
}

export function GithubStatsRoom({ onExit }: GithubStatsRoomProps) {
  const meta = roomMeta["github-stats"];

  return (
    <>
      <GalleryEnvironment />

      {/* Room title placard */}
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

      {/* Stats inscription on back wall */}
      <Html center distanceFactor={9} position={[0, 4.2, -7.3]} transform>
        <div style={{
          pointerEvents: "none",
          userSelect: "none",
          padding: "14px 22px",
          border: "1px solid #c9a84c55",
          background: "rgba(8,5,2,0.75)",
          minWidth: "220px",
        }}>
          <p style={{
            fontFamily: "Georgia, serif",
            fontSize: "7.5px",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a84c66",
            textAlign: "center",
            marginBottom: "12px",
          }}>
            PROFILE METRICS
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", textAlign: "center" }}>
            {KEY_STATS.map((s) => (
              <div key={s.label}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "7px", letterSpacing: "0.2em", color: "#c9a84c88", textTransform: "uppercase" }}>
                  {s.label}
                </p>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "17px", color: "#d4c9a8", marginTop: "3px" }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Html>

      {/* Language towers */}
      {LANGUAGES.map((lang, i) => (
        <LanguageTower
          key={lang.name}
          name={lang.name}
          pct={lang.pct}
          color={lang.color}
          position={TOWER_POSITIONS[i]}
        />
      ))}

      {/* Per-tower accent lights */}
      {LANGUAGES.map((lang, i) => {
        const [x, , z] = TOWER_POSITIONS[i];
        const h = (lang.pct / MAX_PCT) * MAX_HEIGHT;
        return (
          <pointLight
            key={lang.name}
            position={[x, h + 1.5, z + 0.5]}
            color={lang.color}
            intensity={0.4}
            distance={4}
            decay={2}
          />
        );
      })}

      <ExitDoor position={[0, 0, -6]} onExit={onExit} />
    </>
  );
}
