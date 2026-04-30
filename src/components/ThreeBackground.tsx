'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface SphereProps {
  position: [number, number, number];
  color: string;
  speed: number;
}

function AnimatedSphere({ position, color, speed }: SphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeBackground() {
  const spheres = [
    { position: [-4, 2, -10], color: '#2E5BFF', speed: 0.3 },
    { position: [4, -2, -8], color: '#5B7DFF', speed: -0.2 },
    { position: [0, 3, -12], color: '#1A3FD9', speed: 0.4 },
    { position: [-3, -1, -6], color: '#2E5BFF', speed: -0.3 },
  ];

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#5B7DFF" />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#2E5BFF" />
        {spheres.map((sphere, index) => (
          <AnimatedSphere key={index} {...sphere} />
        ))}
      </Canvas>
    </div>
  );
}
