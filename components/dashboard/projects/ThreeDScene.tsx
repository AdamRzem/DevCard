"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import { PCFShadowMap, type Group } from "three";

import type { DashboardProject, ProjectGroup } from "@/lib/dashboard/projects";

interface ThreeDSceneProps {
  projects: DashboardProject[];
  sceneLabel?: string;
  className?: string;
}

interface ExhibitLayoutItem {
  project: DashboardProject;
  position: [number, number, number];
  rotationY: number;
}

const groupColorMap: Record<ProjectGroup, string> = {
  featured: "#ff5a1f",
  "open-source": "#12f58d",
  experiments: "#f8c24b",
};

function buildExhibitLayout(projects: DashboardProject[]): ExhibitLayoutItem[] {
  const visibleProjects = projects.slice(0, 6);
  const span = Math.PI * 0.92;
  const radius = Math.max(4.1, 2.6 + visibleProjects.length * 0.48);

  return visibleProjects.map((project, index) => {
    const step = visibleProjects.length > 1 ? span / (visibleProjects.length - 1) : 0;
    const angle = visibleProjects.length === 1 ? 0 : -span / 2 + index * step;

    return {
      project,
      position: [Math.sin(angle) * radius, 0, Math.cos(angle) * radius - 2.1],
      rotationY: -angle * 0.55,
    };
  });
}

function MuseumFloor() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.93} metalness={0.06} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.045, -2.1]} receiveShadow>
        <ringGeometry args={[2.4, 7.2, 64]} />
        <meshStandardMaterial color="#181818" roughness={0.76} metalness={0.18} />
      </mesh>
    </group>
  );
}

interface ProjectExhibitProps {
  item: ExhibitLayoutItem;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

function ProjectExhibit({ item, activeId, setActiveId }: ProjectExhibitProps) {
  const groupRef = useRef<Group>(null);
  const elapsedRef = useRef(0);
  const isActive = item.project.id === activeId;
  const accent = groupColorMap[item.project.group];

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    elapsedRef.current += delta;
    const lift = 0.08 + Math.sin(elapsedRef.current * 1.3 + item.rotationY) * 0.05;
    groupRef.current.position.y = lift;
  });

  const openProject = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.open(item.project.githubUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <group ref={groupRef} position={item.position} rotation={[0, item.rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[1.85, 0.4, 1.85]} />
        <meshStandardMaterial color="#161616" roughness={0.32} metalness={0.64} />
      </mesh>

      <mesh
        castShadow
        position={[0, 1.02, 0]}
        onPointerOver={(event) => {
          event.stopPropagation();
          setActiveId(item.project.id);
        }}
        onPointerOut={() => {
          if (activeId === item.project.id) {
            setActiveId(null);
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          openProject();
        }}
      >
        <boxGeometry args={[1.24, 1.28, 0.18]} />
        <meshStandardMaterial
          color={isActive ? "#efe8db" : "#292929"}
          emissive={accent}
          emissiveIntensity={isActive ? 0.42 : 0.2}
          roughness={0.26}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[0, 1.96, 0]}>
        <sphereGeometry args={[0.15, 20, 20]} />
        <meshStandardMaterial emissive={accent} emissiveIntensity={isActive ? 0.95 : 0.45} color={accent} />
      </mesh>
    </group>
  );
}

function MuseumScene({ items, activeId, setActiveId }: { items: ExhibitLayoutItem[]; activeId: string | null; setActiveId: (id: string | null) => void; }) {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 7, 20]} />

      <ambientLight intensity={0.46} />
      <directionalLight
        castShadow
        intensity={1.18}
        position={[8, 11, 6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight intensity={14} position={[-6, 4, -2]} color="#ff5a1f" decay={1.8} />
      <pointLight intensity={10} position={[6, 3.5, 1]} color="#12f58d" decay={2} />

      <MuseumFloor />
      {items.map((item) => (
        <ProjectExhibit
          key={item.project.id}
          item={item}
          activeId={activeId}
          setActiveId={setActiveId}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5.3}
        maxDistance={12}
        minPolarAngle={Math.PI / 3.3}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  );
}

export function ThreeDScene({ projects, sceneLabel = "MUSEUM_FLOOR", className }: ThreeDSceneProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const items = useMemo(() => buildExhibitLayout(projects), [projects]);

  if (items.length === 0) {
    return (
      <section className={`hud-panel p-6 ${className ?? ""}`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {sceneLabel}
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No exhibit records found.</p>
      </section>
    );
  }

  return (
    <section className={`hud-panel relative overflow-hidden ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-[linear-gradient(180deg,rgba(5,5,5,0.84),transparent)]" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-signal)]">
            {sceneLabel}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
            ORBIT // CLICK_EXHIBIT_TO_OPEN_REPO
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          EXHIBITS: {items.length}
        </p>
      </header>

      <div className="h-[340px] sm:h-[420px] lg:h-[500px]">
        <Canvas camera={{ position: [0, 4.1, 8.6], fov: 44 }} dpr={[1, 1.75]} shadows={{ type: PCFShadowMap }}>
          <MuseumScene items={items} activeId={activeId} setActiveId={setActiveId} />
        </Canvas>
      </div>

      <div className="relative z-20 border-t border-[var(--color-border)] bg-[color:rgb(5_5_5_/_0.86)] p-4">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const isActive = activeId === item.project.id;

            return (
              <a
                key={item.project.id}
                href={item.project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`border px-3 py-2 transition-colors duration-100 ${
                  isActive
                    ? "border-[var(--color-accent)] bg-[rgba(255,69,0,0.12)]"
                    : "border-[var(--color-border)] bg-[rgba(229,226,225,0.04)] hover:border-[var(--color-accent)]"
                }`}
                onMouseEnter={() => setActiveId(item.project.id)}
                onMouseLeave={() => {
                  if (activeId === item.project.id) {
                    setActiveId(null);
                  }
                }}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-signal)]">
                  {item.project.codeName}
                </p>
                <p className="mt-1 font-headline text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {item.project.title}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
