import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import styled from 'styled-components';

interface SimpleBeamsProps {
  beamWidth?: number;
  beamHeight?: number;
  beamNumber?: number;
  lightColor?: string;
  speed?: number;
}

const AnimatedBeam: React.FC<{ position: [number, number, number]; speed: number }> = ({ position, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z = Math.sin(state.clock.elapsedTime * speed + position[0]) * 2;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * speed * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[0.5, 15]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const SimpleBeams: React.FC<SimpleBeamsProps> = ({
  beamWidth = 2,
  beamHeight = 15,
  beamNumber = 8,
  lightColor = "#ffffff",
  speed = 1.5,
}) => {
  const beams = useMemo(() => {
    const beamArray = [];
    for (let i = 0; i < beamNumber; i++) {
      const x = (i - beamNumber / 2) * beamWidth;
      beamArray.push(
        <AnimatedBeam 
          key={i} 
          position={[x, 0, 0]} 
          speed={speed + i * 0.1} 
        />
      );
    }
    return beamArray;
  }, [beamNumber, beamWidth, speed]);

  return (
    <BeamsContainer>
      <Canvas dpr={[1, 2]} frameloop="always">
        <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} />
        <ambientLight intensity={0.5} />
        <directionalLight color={lightColor} intensity={1} position={[0, 3, 10]} />
        <group rotation={[0.2, 0, 0]}>
          {beams}
        </group>
        <color attach="background" args={["#000000"]} />
      </Canvas>
    </BeamsContainer>
  );
};

const BeamsContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
`;

export default SimpleBeams;