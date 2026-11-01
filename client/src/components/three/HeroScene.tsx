'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function PerfumeBottle({ color = '#c8a03c' }: { color?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.x = Math.sin(t * 0.3) * 0.08;
  });

  const glassColor = useMemo(() => new THREE.Color(color), [color]);

  return (
    <group ref={groupRef}>
      {/* Base body */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.48, 1.7, 48, 1]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          transmission={0.88}
          roughness={0.04}
          metalness={0.05}
          ior={1.52}
          thickness={0.6}
          envMapIntensity={2}
          reflectivity={1}
        />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.38, 0.44, 1.3, 48, 1]} />
        <meshPhysicalMaterial
          color={new THREE.Color('#c8700c')}
          transparent
          transmission={0.6}
          roughness={0.02}
          metalness={0}
          ior={1.36}
          thickness={0.8}
          opacity={0.7}
        />
      </mesh>

      {/* Shoulder curve (top) */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          transmission={0.88}
          roughness={0.04}
          metalness={0.05}
          ior={1.52}
          thickness={0.3}
          envMapIntensity={2}
        />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.21, 0.4, 32, 1]} />
        <meshPhysicalMaterial
          color={glassColor}
          transparent
          transmission={0.9}
          roughness={0.02}
          metalness={0.08}
          ior={1.52}
          thickness={0.2}
          envMapIntensity={2}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <cylinderGeometry args={[0.17, 0.17, 0.32, 32]} />
        <meshStandardMaterial
          color="#c8a03c"
          metalness={0.95}
          roughness={0.08}
        />
      </mesh>

      {/* Cap top dome */}
      <mesh position={[0, 1.76, 0]} castShadow>
        <sphereGeometry args={[0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial
          color="#c8a03c"
          metalness={0.95}
          roughness={0.08}
        />
      </mesh>
    </group>
  );
}

function FloatingOrb({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = t * 0.5;
    meshRef.current.rotation.z = t * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.12}
          distort={0.5}
          speed={2}
          roughness={0}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

function AmbientParticles() {
  const count = 80;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  const meshRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c8a03c"
        size={0.025}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

interface HeroSceneProps {
  bottleColor?: string;
}

export default function HeroScene({ bottleColor = '#d4b896' }: HeroSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} color="#f0d090" />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#6070ff" />
      <pointLight position={[0, 3, 0]} intensity={0.8} color="#c8a03c" />

      <Environment preset="city" />

      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <PerfumeBottle color={bottleColor} />
      </Float>

      <FloatingOrb position={[-3, 1, -2]} color="#c8a03c" scale={1.2} />
      <FloatingOrb position={[3.5, -1, -3]} color="#9060ff" scale={0.8} />
      <FloatingOrb position={[0, -3, -4]} color="#c8a03c" scale={1.6} />

      <AmbientParticles />
    </Canvas>
  );
}
