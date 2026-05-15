"use client";

// Museum main hall — classical European aesthetic (warm marble, gold trim)
export function GalleryEnvironment() {
  return (
    <>
      <color attach="background" args={["#1c1610"]} />
      <fog attach="fog" args={["#2a1f14", 18, 36]} />

      {/* Ambient warm light */}
      <hemisphereLight args={["#f5e8c8", "#2a1a08", 0.45]} />

      {/* Main overhead chandelier-style */}
      <pointLight position={[0, 7.2, -2]} intensity={3.5} color="#f5dfa0" distance={22} decay={1.6} castShadow shadow-mapSize={[1024, 1024]} />

      {/* Flanking wall sconces */}
      <pointLight position={[-9, 4, -4]} intensity={1.8} color="#f0c870" distance={12} decay={2} />
      <pointLight position={[9, 4, -4]} intensity={1.8} color="#f0c870" distance={12} decay={2} />
      <pointLight position={[-9, 4, 4]} intensity={1.2} color="#f0c870" distance={10} decay={2} />
      <pointLight position={[9, 4, 4]} intensity={1.2} color="#f0c870" distance={10} decay={2} />

      {/* FLOOR — polished dark marble */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#1a1208" roughness={0.12} metalness={0.55} />
      </mesh>

      {/* FLOOR — light marble inlay strip (center aisle) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.015, -2]}>
        <planeGeometry args={[4, 18]} />
        <meshStandardMaterial color="#e8ddc8" roughness={0.25} metalness={0.12} />
      </mesh>
      {/* Dark border strips on inlay */}
      <mesh rotation-x={-Math.PI / 2} position={[-2.1, -0.01, -2]}>
        <planeGeometry args={[0.12, 18]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[2.1, -0.01, -2]}>
        <planeGeometry args={[0.12, 18]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* BACK WALL — warm cream marble with veining color */}
      <mesh position={[0, 5, -10]} receiveShadow>
        <planeGeometry args={[28, 12]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.88} metalness={0.02} />
      </mesh>

      {/* SIDE WALLS */}
      <mesh position={[-14, 5, -2]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[28, 12]} />
        <meshStandardMaterial color="#e0d4ba" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[14, 5, -2]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[28, 12]} />
        <meshStandardMaterial color="#e0d4ba" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* ENTRANCE WALL behind camera */}
      <mesh position={[0, 5, 10]} rotation-y={Math.PI} receiveShadow>
        <planeGeometry args={[28, 12]} />
        <meshStandardMaterial color="#e0d4ba" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* CEILING — ornate white */}
      <mesh position={[0, 10, -2]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.96} metalness={0} />
      </mesh>

      {/* Ceiling gold cornice border — front/back */}
      <mesh position={[0, 9.85, -10]}>
        <boxGeometry args={[28, 0.32, 0.22]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.18} metalness={0.85} />
      </mesh>
      <mesh position={[0, 9.85, 10]}>
        <boxGeometry args={[28, 0.32, 0.22]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.18} metalness={0.85} />
      </mesh>
      {/* Ceiling gold cornice — sides */}
      <mesh position={[-14, 9.85, -2]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[28, 0.32, 0.22]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.18} metalness={0.85} />
      </mesh>
      <mesh position={[14, 9.85, -2]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[28, 0.32, 0.22]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.18} metalness={0.85} />
      </mesh>

      {/* Wall dado rail (gold molding strip mid-wall) */}
      <mesh position={[0, 3.2, -9.9]}>
        <boxGeometry args={[28, 0.14, 0.12]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.82} />
      </mesh>
      <mesh position={[-13.9, 3.2, -2]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[28, 0.14, 0.12]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.82} />
      </mesh>
      <mesh position={[13.9, 3.2, -2]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[28, 0.14, 0.12]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.82} />
      </mesh>

      {/* COLUMNS — left side */}
      {[-7, -11].map((x, i) => (
        <Column key={`col-l-${i}`} position={[x, 0, -2]} />
      ))}
      {/* COLUMNS — right side */}
      {[7, 11].map((x, i) => (
        <Column key={`col-r-${i}`} position={[x, 0, -2]} />
      ))}

      {/* Wall sconce props */}
      <WallSconce position={[-13.5, 5, -4]} />
      <WallSconce position={[13.5, 5, -4]} />
      <WallSconce position={[-13.5, 5, 2]} />
      <WallSconce position={[13.5, 5, 2]} />

      {/* Central ceiling chandelier decoration */}
      <mesh position={[0, 9.5, -2]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.15} metalness={0.9} />
      </mesh>
      <mesh position={[0, 9.3, -2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
        <meshStandardMaterial color="#a08030" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Chandelier arms */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.65, 9.2, -2 + Math.sin(angle) * 0.65]}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial color="#f5dfa0" emissive="#f5c040" emissiveIntensity={1.2} roughness={0.3} metalness={0.1} />
          </mesh>
        );
      })}
    </>
  );
}

function Column({ position }: { position: [number, number, number] }) {
  const [x, , z] = position;
  return (
    <group position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.88, 0.4, 0.88]} />
        <meshStandardMaterial color="#d4c9a8" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.36, 9.2, 16]} />
        <meshStandardMaterial color="#ddd0b0" roughness={0.52} metalness={0.06} />
      </mesh>
      {/* Capital */}
      <mesh position={[0, 9.5, 0]} castShadow>
        <boxGeometry args={[0.86, 0.46, 0.86]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.22} metalness={0.78} />
      </mesh>
      {/* Capital flare */}
      <mesh position={[0, 9.26, 0]}>
        <cylinderGeometry args={[0.44, 0.32, 0.24, 16]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.22} metalness={0.78} />
      </mesh>
    </group>
  );
}

function WallSconce({ position }: { position: [number, number, number] }) {
  const [x, y, z] = position;
  const side = x < 0 ? 1 : -1;
  return (
    <group position={[x, y, z]}>
      <mesh position={[side * 0.1, 0, 0]} rotation-z={side * 0.3}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#c9a84c" roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[side * 0.18, 0.1, 0]}>
        <cylinderGeometry args={[0.12, 0.08, 0.2, 12]} />
        <meshStandardMaterial color="#f5dfa0" emissive="#f5c040" emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}
