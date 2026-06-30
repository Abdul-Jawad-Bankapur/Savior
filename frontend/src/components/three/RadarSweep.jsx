import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function RadarSweep({ radius = 3 }) {
  const groupRef = useRef();
  const sweepRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.z -= delta * 0.5;
    }
    if (sweepRef.current) {
      sweepRef.current.material.opacity = 0.15 + 0.1 * Math.sin(state.clock.elapsedTime * 3);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={sweepRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 64, 0, Math.PI / 4]} />
        <meshStandardMaterial
          color="#2196f3"
          emissive="#2196f3"
          emissiveIntensity={1}
          transparent
          opacity={0.2}
          side="double"
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.02, radius, 64]} />
        <meshStandardMaterial
          color="#2196f3"
          transparent
          opacity={0.15}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.6 - 0.01, radius * 0.6, 64]} />
        <meshStandardMaterial
          color="#2196f3"
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}
