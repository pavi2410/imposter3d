import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SpaceBackground = () => {
  // Create a reference to the stars group
  const starsRef = useRef();
  
  // Generate random stars
  const starCount = 2000;
  const stars = useMemo(() => {
    const temp = [];
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    // Generate random positions for stars
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Position stars in a large sphere around the scene
      const radius = 50 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random star colors (mostly white with hints of blue and yellow)
      const r = 0.9 + Math.random() * 0.1;
      const g = 0.9 + Math.random() * 0.1;
      const b = 0.9 + Math.random() * 0.1;
      
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
      
      // Random star sizes
      sizes[i] = Math.random() * 2;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    temp.push(
      <points key="stars" geometry={starGeometry}>
        <pointsMaterial 
          size={0.1} 
          vertexColors 
          transparent 
          opacity={0.8}
          sizeAttenuation
        />
      </points>
    );
    
    return temp;
  }, []);

  // Create nebula effect
  const nebula = useMemo(() => {
    // Create a large sphere with a custom shader material for the nebula effect
    const geometry = new THREE.SphereGeometry(80, 64, 64);
    
    // Use a simple custom material with a space-like texture
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),
      color: new THREE.Color(0x000020),
      transparent: true,
      opacity: 0.8
    });
    
    return <mesh geometry={geometry} material={material} />;
  }, []);

  // Animate stars twinkling
  useFrame((state, delta) => {
    if (starsRef.current) {
      // Slowly rotate the entire star field
      starsRef.current.rotation.y += delta * 0.01;
      
      // Access the point material to animate opacity for twinkling effect
      const material = starsRef.current.children[0].material;
      if (material) {
        material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      }
    }
  });

  return (
    <group ref={starsRef}>
      {nebula}
      {stars}
    </group>
  );
};

export default SpaceBackground;