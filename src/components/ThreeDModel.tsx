import { Canvas } from '@react-three/fiber';
import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Bottle() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smoothly follow mouse
    const targetRotateX = state.mouse.y * 0.5;
    const targetRotateY = state.mouse.x * 0.5;
    
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotateX, 0.1);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotateY + state.clock.getElapsedTime() * 0.2, 0.1);
    
    // Floating animation
    meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
  });

  return (
    <group>
      {/* Bottle Body */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.1 : 1}
      >
        <cylinderGeometry args={[0.8, 1, 3.5, 32]} />
        <MeshDistortMaterial
          color="#A3002A"
          roughness={0.1}
          metalness={0.8}
          distort={0.2}
          speed={2}
        />
        
        {/* Cap */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2, 32]} />
          <meshStandardMaterial color="#FF2E2E" metalness={1} roughness={0.1} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.4, 0.8, 0.6, 32]} />
          <meshStandardMaterial color="#A3002A" metalness={0.8} roughness={0.1} />
        </mesh>

        {/* Label Placeholder */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[1.01, 1.01, 1.5, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </mesh>
    </group>
  );
}

export default function ThreeDModel() {
  return (
    <div className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#FF2E2E" />
          
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <Bottle />
          </Float>

          <Environment preset="city" />
          <ContactShadows 
            position={[0, -2.5, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
