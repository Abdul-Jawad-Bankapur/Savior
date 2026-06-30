import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

export default function Globe({ position = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef();
  const hotspotRefs = useRef([]);

  const hotspots = [
    { lat: 12.97, lng: 77.59, label: 'Bangalore' },
    { lat: 28.61, lng: 77.23, label: 'Delhi' },
    { lat: 19.08, lng: 72.88, label: 'Mumbai' },
    { lat: 13.08, lng: 80.27, label: 'Chennai' },
    { lat: 22.57, lng: 88.36, label: 'Kolkata' },
    { lat: 17.38, lng: 78.49, label: 'Hyderabad' },
  ];

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    hotspotRefs.current.forEach((ref, i) => {
      if (ref) {
        const pulse = 0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 2 + i);
        ref.material.opacity = pulse;
        ref.scale.setScalar(1 + 0.3 * Math.sin(state.clock.elapsedTime * 2 + i));
      }
    });
  });

  function latLngToVec3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return [
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    ];
  }

  return (
    <group position={position} scale={scale}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshStandardMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.02, 48, 48]} />
        <MeshDistortMaterial
          color="#2196f3"
          transparent
          opacity={0.15}
          distort={0.2}
          speed={2}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.1, 48, 48]} />
        <meshStandardMaterial
          color="#6366f1"
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>

      {hotspots.map((spot, i) => {
        const pos = latLngToVec3(spot.lat, spot.lng, 2.15);
        const colors = ['#ff3b3b', '#ff9f1c', '#2196f3', '#00e676', '#ff3b3b', '#ff9f1c'];
        return (
          <group key={i} position={pos}>
            <mesh ref={el => hotspotRefs.current[i] = el}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial
                color={colors[i]}
                emissive={colors[i]}
                emissiveIntensity={3}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh>
              <ringGeometry args={[0.1, 0.15, 32]} />
              <meshStandardMaterial
                color={colors[i]}
                emissive={colors[i]}
                emissiveIntensity={1}
                transparent
                opacity={0.3}
                side="double"
              />
            </mesh>
          </group>
        );
      })}

      <pointLight position={[5, 3, 5]} intensity={1} color="#6366f1" />
      <pointLight position={[-3, -2, 3]} intensity={0.5} color="#2196f3" />
      <ambientLight intensity={0.3} />
    </group>
  );
}
