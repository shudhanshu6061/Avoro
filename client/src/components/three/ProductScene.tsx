'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

const CATEGORY_COLORS: Record<string, string> = {
  floral:   '#e8a0c8',
  woody:    '#c8780c',
  fresh:    '#7ec8e8',
  oriental: '#c850a0',
  default:  '#d4b896',
};

function BottleGeometry({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    gl.domElement.closest('canvas')?.addEventListener('mousemove', handleMove as EventListener);
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [gl]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y += (mouse.x * 0.4 - groupRef.current.rotation.y + t * 0.12) * 0.05;
    groupRef.current.rotation.x += (mouse.y * 0.15 - groupRef.current.rotation.x) * 0.05;
  });

  const glassColor = useMemo(() => new THREE.Color(color), [color]);
  const liquidColor = useMemo(() => new THREE.Color(color).multiplyScalar(0.7), [color]);

  return (
    <group ref={groupRef} scale={1.6}>
      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.48, 1.7, 64, 1]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          transmission={0.9}
          roughness={0.03}
          metalness={0.04}
          ior={1.52}
          thickness={0.7}
          envMapIntensity={2.5}
          reflectivity={1}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>

      {/* Liquid */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.38, 0.44, 1.28, 64, 1]} />
        <meshPhysicalMaterial
          color={liquidColor}
          transparent
          transmission={0.5}
          roughness={0.01}
          metalness={0}
          ior={1.36}
          thickness={1}
          opacity={0.75}
        />
      </mesh>

      {/* Shoulder top */}
      <mesh position={[0, 0.86, 0]}>
        <sphereGeometry args={[0.42, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          transmission={0.9}
          roughness={0.03}
          metalness={0.04}
          ior={1.52}
          thickness={0.3}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.13, 0.21, 0.42, 32]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          transmission={0.9}
          roughness={0.02}
          metalness={0.06}
          ior={1.52}
          thickness={0.2}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* Gold collar ring */}
      <mesh position={[0, 0.99, 0]}>
        <torusGeometry args={[0.3, 0.025, 16, 64]} />
        <meshStandardMaterial color="#c8a03c" metalness={0.98} roughness={0.05} />
      </mesh>

      {/* Cap body */}
      <mesh position={[0, 1.62, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.36, 32]} />
        <meshStandardMaterial color="#c8a03c" metalness={0.95} roughness={0.06} />
      </mesh>

      {/* Cap dome */}
      <mesh position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#c8a03c" metalness={0.95} roughness={0.06} />
      </mesh>

      {/* Engraving label area */}
      <mesh position={[0, -0.1, 0.49]}>
        <planeGeometry args={[0.55, 0.9]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.04}
          metalness={0}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

function SceneParticles({ color }: { color: string }) {
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi);
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.06;
    ref.current.rotation.x = state.clock.elapsedTime * 0.03;
  });

  const pColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={pColor}
        size={0.03}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

interface ProductSceneProps {
  category?: string;
}

export default function ProductScene({ category = 'default' }: ProductSceneProps) {
  const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.default;

  return (
    <Canvas
      camera={{ position: [0, 0.8, 5.5], fov: 38 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
      shadows
    >
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.5}
        color="#f5e8c0"
        castShadow
      />
      <directionalLight position={[-4, -2, -4]} intensity={0.5} color="#4060d0" />
      <pointLight position={[0, 4, 1]} intensity={1.2} color={color} />
      <pointLight position={[0, -3, -2]} intensity={0.4} color="#c8a03c" />

      <Environment preset="studio" />

      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
        <BottleGeometry color={color} />
      </Float>

      <SceneParticles color={color} />
    </Canvas>
  );
}
