'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Procedural glass perfume bottle ──────────── */
function GlassBottle() {
  const groupRef = useRef<THREE.Group>(null!);
  const liquidRef = useRef<THREE.Mesh>(null!);

  /* Glass material — MeshPhysicalMaterial for realistic transmission */
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    transmission: 0.96,
    roughness: 0.04,
    metalness: 0.06,
    ior: 1.52,
    thickness: 1.8,
    transparent: true,
    opacity: 0.92,
    color: new THREE.Color('#faf7f3'),
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  }), []);

  /* Amber liquid inside */
  const liquidMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#D4875A'),
    transmission: 0.6,
    roughness: 0.1,
    metalness: 0.0,
    transparent: true,
    opacity: 0.85,
    ior: 1.45,
    thickness: 0.8,
  }), []);

  /* Gold cap material */
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C8A060'),
    metalness: 0.95,
    roughness: 0.08,
    envMapIntensity: 3.0,
  }), []);

  useFrame(({ clock }) => {
    if (liquidRef.current) {
      liquidRef.current.material = liquidMat;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bottle body — flattened box with rounded shape */}
      <mesh material={glassMat} castShadow>
        <boxGeometry args={[1.2, 1.8, 0.7, 4, 4, 4]} />
      </mesh>

      {/* Liquid fill inside */}
      <mesh ref={liquidRef} material={liquidMat} position={[0, -0.15, 0]}>
        <boxGeometry args={[0.95, 1.25, 0.52]} />
      </mesh>

      {/* Bottle neck */}
      <mesh material={glassMat} position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.2, 0.32, 0.45, 24]} />
      </mesh>

      {/* Gold collar */}
      <mesh material={goldMat} position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.08, 24]} />
      </mesh>

      {/* Gold cap */}
      <mesh material={goldMat} position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.3, 0.28, 0.65, 24]} />
      </mesh>
      {/* Cap top dome */}
      <mesh material={goldMat} position={[0, 2.07, 0]}>
        <sphereGeometry args={[0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Spray nozzle */}
      <mesh material={goldMat} position={[0.28, 1.38, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.18, 10]} />
      </mesh>
    </group>
  );
}

/* ─── Floating bottle with env lighting ────────── */
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#fff5e8" />
      <directionalLight position={[5, 8, 5]} intensity={2.5} color="#fff0d8" castShadow />
      <pointLight position={[-6, 4, -4]} intensity={1.2} color="#D4AF88" />
      <pointLight position={[6, -2, 6]} intensity={0.8} color="#C9958A" />
      <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.4} penumbra={0.8} color="#ffffff" />

      {/* HDR environment for realistic reflections */}
      <Environment preset="apartment" />

      {/* Floating animation via drei Float */}
      <Float
        speed={1.4}
        rotationIntensity={0.3}
        floatIntensity={0.8}
        floatingRange={[-0.2, 0.2]}
      >
        <GlassBottle />
      </Float>

      {/* Golden sparkles around the bottle */}
      <Sparkles
        count={60}
        scale={4.5}
        size={1.2}
        speed={0.3}
        opacity={0.5}
        color="#D4AF88"
        noise={0.3}
      />
    </>
  );
}

/* ─── Exported canvas wrapper ───────────────────── */
export default function PerfumeBottleScene({ style }: { style?: React.CSSProperties }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%', ...style }}
      camera={{ position: [0, 0.5, 5.5], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <Scene />
    </Canvas>
  );
}
