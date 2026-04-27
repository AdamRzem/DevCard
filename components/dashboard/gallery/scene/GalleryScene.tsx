"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function GalleryFloor() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.06, 0]} receiveShadow>
      <planeGeometry args={[28, 28]} />
      <meshStandardMaterial color="#0b0b0b" roughness={0.92} metalness={0.08} />
    </mesh>
  );
}

function GallerySceneShell() {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={0.7} />
      <GalleryFloor />
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={13}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.08}
      />
    </>
  );
}

export function GalleryScene() {
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
        <Canvas camera={{ position: [0, 3.6, 8.6], fov: 46 }} dpr={[1, 1.5]}>
          <GallerySceneShell />
        </Canvas>
      </div>
    </section>
  );
}
