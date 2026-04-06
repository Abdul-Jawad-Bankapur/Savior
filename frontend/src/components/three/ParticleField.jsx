import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function ParticleField({ count = 200, spread = 8 }) {
  const pointsRef = useRef();

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

    const colorChoice = Math.random();
    if (colorChoice < 0.3) {
      colors[i * 3] = 1; colors[i * 3 + 1] = 0.23; colors[i * 3 + 2] = 0.23;
    } else if (colorChoice < 0.6) {
      colors[i * 3] = 0.13; colors[i * 3 + 1] = 0.59; colors[i * 3 + 2] = 0.95;
    } else {
      colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.9;
    }
  }

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
