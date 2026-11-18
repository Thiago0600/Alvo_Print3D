"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Animação procedimental: um bico de impressora deposita filamento laranja,
// camada a camada, até formar uma peça (jarra torcida). Repete em ciclo.

const LAYERS = 46;
const LAYER_H = 0.045;
const CYCLE = 9; // segundos por peça
const radiusAt = (i: number) => {
  const y = i / LAYERS;
  return 0.55 + 0.22 * Math.sin(y * Math.PI * 1.6 + 0.4) + 0.08 * Math.sin(y * 18) * 0.2;
};

function PrintedPart() {
  const group = useRef<THREE.Group>(null);
  const nozzle = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);

  const layers = useMemo(
    () =>
      Array.from({ length: LAYERS }, (_, i) => {
        const r0 = radiusAt(i);
        const r1 = radiusAt(i + 1);
        const geo = new THREE.CylinderGeometry(r1 * 0.985, r0 * 0.985, LAYER_H * 0.92, 9, 1, false);
        geo.rotateY((i / LAYERS) * Math.PI * 0.9); // torção
        return geo;
      }),
    [],
  );
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ff6b0b", roughness: 0.42, metalness: 0.05, flatShading: true }),
    [],
  );
  const hot = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffb26b", emissive: "#ff6b0b", emissiveIntensity: 1.6 }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() % CYCLE;
    const buildT = Math.min(1, t / (CYCLE - 1.6));
    const exact = buildT * LAYERS;
    const done = Math.floor(exact);
    const frac = exact - done;
    const g = group.current;
    if (g) {
      g.children.forEach((m, i) => {
        const mesh = m as THREE.Mesh;
        mesh.visible = i <= done;
        mesh.material = i === done && buildT < 1 ? hot : mat;
        mesh.scale.setScalar(i === done && buildT < 1 ? 0.35 + 0.65 * frac : 1);
        mesh.scale.y = 1;
      });
    }
    if (nozzle.current) {
      const ang = frac * Math.PI * 2 * 1.0 + done * 0.6;
      const r = radiusAt(Math.min(done, LAYERS - 1)) * (buildT < 1 ? 0.95 : 0);
      const topY = (Math.min(done, LAYERS - 1) + 1) * LAYER_H;
      const parkY = buildT >= 1 ? 0.6 * (t - (CYCLE - 1.6)) : 0;
      nozzle.current.position.set(Math.cos(ang) * r, topY + 0.2 + parkY, Math.sin(ang) * r);
    }
    if (glow.current) glow.current.intensity = buildT < 1 ? 2.2 + Math.sin(t * 40) * 0.4 : 0;
  });

  return (
    <group position={[0, -1.05, 0]}>
      <group ref={group}>
        {layers.map((geo, i) => (
          <mesh key={i} geometry={geo} material={mat} position={[0, i * LAYER_H + LAYER_H / 2, 0]} castShadow />
        ))}
      </group>
      {/* Bico / hotend */}
      <group ref={nozzle}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.42, 0.34, 0.42]} />
          <meshStandardMaterial color="#1a1c20" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.16, 16]} />
          <meshStandardMaterial color="#b8bcc4" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.07, 0.12, 16]} />
          <meshStandardMaterial color="#d7a65a" metalness={0.9} roughness={0.2} />
        </mesh>
        <pointLight ref={glow} color="#ff7a1a" distance={1.6} position={[0, -0.02, 0]} />
      </group>
      {/* Mesa de impressão */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.1, 64]} />
        <meshStandardMaterial color="#15171b" metalness={0.3} roughness={0.8} />
      </mesh>
      <gridHelper args={[4.2, 21, "#2d3138", "#22252b"]} position={[0, 0.002, 0]} />
      <ContactShadows position={[0, 0.004, 0]} opacity={0.6} scale={5} blur={2.2} far={2.5} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [2.6, 1.5, 2.9], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-label="Animação 3D de uma peça a ser impressa camada a camada"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#9fb4ff" />
      <PrintedPart />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.9} minPolarAngle={0.6} maxPolarAngle={1.45} />
    </Canvas>
  );
}
