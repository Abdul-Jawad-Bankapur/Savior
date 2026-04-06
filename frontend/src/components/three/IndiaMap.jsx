import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const INDIA_CITIES = [
  { name: 'Delhi', lat: 28.61, lng: 77.23, severity: 7 },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, severity: 5 },
  { name: 'Bangalore', lat: 12.97, lng: 77.59, severity: 9 },
  { name: 'Chennai', lat: 13.08, lng: 80.27, severity: 4 },
  { name: 'Kolkata', lat: 22.57, lng: 88.36, severity: 6 },
  { name: 'Hyderabad', lat: 17.38, lng: 78.49, severity: 8 },
  { name: 'Pune', lat: 18.52, lng: 73.86, severity: 3 },
  { name: 'Ahmedabad', lat: 23.02, lng: 72.57, severity: 5 },
  { name: 'Jaipur', lat: 26.92, lng: 75.79, severity: 4 },
  { name: 'Lucknow', lat: 26.85, lng: 80.95, severity: 6 },
];

function latLngToVec3(lat, lng, height) {
  const baseX = (lng - 68) / 20;
  const baseY = (37 - lat) / 15;
  return [baseX * 5 - 1.25, baseY * 4 - 1.3, 0];
}

function getSeverityColor(severity) {
  if (severity >= 8) return '#ff3b3b';
  if (severity >= 6) return '#ff9f1c';
  if (severity >= 4) return '#2196f3';
  return '#00e676';
}

function Bar({ city, index }) {
  const meshRef = useRef();
  const pos = latLngToVec3(city.lat, city.lng, city.severity);
  const height = city.severity * 0.12;
  const color = getSeverityColor(city.severity);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.opacity = 0.6 + 0.4 * Math.sin(state.clock.elapsedTime * 1.5 + index);
      meshRef.current.scale.y = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 2 + index);
    }
  });

  return (
    <group position={[pos[0], pos[1], 0]}>
      <mesh ref={meshRef} position={[0, height / 2, 0]}>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <circleGeometry args={[0.06, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

export default function IndiaMap() {
  const gridRef = useRef();

  useFrame((state, delta) => {
    if (gridRef.current) {
      gridRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={gridRef}>
        <ringGeometry args={[2.5, 3.5, 64]} />
        <meshStandardMaterial
          color="#2196f3"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      <mesh>
        <ringGeometry args={[1.8, 2.2, 64]} />
        <meshStandardMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.05}
        />
      </mesh>

      {INDIA_CITIES.map((city, i) => (
        <Bar key={city.name} city={city} index={i} />
      ))}

      <pointLight position={[0, 0, 3]} intensity={1} color="#2196f3" />
      <ambientLight intensity={0.15} />
    </group>
  );
}
