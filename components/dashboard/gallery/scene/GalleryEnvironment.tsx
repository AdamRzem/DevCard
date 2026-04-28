"use client";

import { MeshReflectorMaterial } from "@react-three/drei";

type AccentStripProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
  color: string;
};

function AccentStrip({ position, rotation = [0, 0, 0], scale, color }: AccentStripProps) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        roughness={0.25}
        metalness={0.35}
      />
    </mesh>
  );
}

export function GalleryEnvironment() {
  return (
    <>
      <color attach="background" args={["#050505"]} />
      <fog attach="fog" args={["#050505", 8, 22]} />
      <ambientLight intensity={0.42} />

      <group>
        <mesh rotation-x={-Math.PI / 2} position={[0, -0.06, 0]} receiveShadow>
          <planeGeometry args={[34, 34]} />
          <MeshReflectorMaterial
            color="#0b0b0b"
            roughness={0.75}
            metalness={0.2}
            blur={[120, 40]}
            resolution={512}
            mixBlur={1}
            mixStrength={14}
            depthScale={1}
            minDepthThreshold={0.2}
            maxDepthThreshold={1.2}
          />
        </mesh>

        <mesh position={[0, 2.2, -9]} receiveShadow>
          <planeGeometry args={[34, 6]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.9} metalness={0.08} />
        </mesh>

        <mesh position={[-13, 2.2, 0]} rotation-y={Math.PI / 2} receiveShadow>
          <planeGeometry args={[24, 6]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.88} metalness={0.1} />
        </mesh>

        <mesh position={[13, 2.2, 0]} rotation-y={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[24, 6]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.88} metalness={0.1} />
        </mesh>

        <mesh position={[0, 4.6, 0]} rotation-x={Math.PI / 2} receiveShadow>
          <planeGeometry args={[34, 24]} />
          <meshStandardMaterial color="#070707" roughness={0.95} metalness={0.05} />
        </mesh>
      </group>

      <group>
        <AccentStrip
          position={[0, 0.02, -3.8]}
          scale={[12, 0.05, 0.3]}
          color="#ff5a1f"
        />
        <AccentStrip
          position={[0, 0.02, 3.8]}
          scale={[12, 0.05, 0.3]}
          color="#12f58d"
        />
        <AccentStrip
          position={[-10.5, 0.02, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 0.05, 0.3]}
          color="#f8c24b"
        />
      </group>
    </>
  );
}
