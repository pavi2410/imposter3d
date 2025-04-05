import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const SpaceBackground = () => {
  // Create a reference to the stars group
  const starsRef = useRef();
  
  // Generate random stars
  const starCount = 3000; // Increased star count for more density
  const stars = useMemo(() => {
    const temp = [];
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2, // Increased base size
      transparent: true,
      opacity: 0.9, // Increased opacity
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
      
      // More vibrant star colors (wider color range for a more comical look)
      const colorChoice = Math.random();
      let r, g, b;
      
      if (colorChoice < 0.3) {
        // Blue-ish stars
        r = 0.5 + Math.random() * 0.3;
        g = 0.7 + Math.random() * 0.3;
        b = 0.9 + Math.random() * 0.1;
      } else if (colorChoice < 0.6) {
        // Yellow-ish stars
        r = 0.9 + Math.random() * 0.1;
        g = 0.9 + Math.random() * 0.1;
        b = 0.5 + Math.random() * 0.3;
      } else if (colorChoice < 0.8) {
        // Pink-ish stars
        r = 0.9 + Math.random() * 0.1;
        g = 0.5 + Math.random() * 0.3;
        b = 0.8 + Math.random() * 0.2;
      } else {
        // White stars
        r = 0.9 + Math.random() * 0.1;
        g = 0.9 + Math.random() * 0.1;
        b = 0.9 + Math.random() * 0.1;
      }
      
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
      
      // Random star sizes with larger variation
      sizes[i] = 1 + Math.random() * 4; // Bigger range for more noticeable stars
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    temp.push(
      <points key="stars" geometry={starGeometry}>
        <pointsMaterial 
          size={0.5} // Increased from 0.1 to make stars more visible
          vertexColors 
          transparent 
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    );
    
    return temp;
  }, []);

  // Create texture once outside the render cycle
  const nebulaTexture = useMemo(() => {
    return new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
  }, []);

  // Create nebula effect with more vibrant colors
  const nebula = useMemo(() => {
    // Create a large sphere with a custom shader material for the nebula effect
    const geometry = new THREE.SphereGeometry(100, 64, 64); // Larger sphere
    
    // Use a simple custom material with a space-like texture and more vibrant color
    const material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: nebulaTexture,
      color: new THREE.Color(0x0a0a40), // Slightly more vibrant dark blue
      transparent: true,
      opacity: 0.7 // Slightly reduced opacity to make stars pop more
    });
    
    return <mesh geometry={geometry} material={material} />;
  }, [nebulaTexture]);

  // Animate stars twinkling with more pronounced effect
  useFrame((state, delta) => {
    if (starsRef.current) {
      // Rotate the entire star field a bit faster
      starsRef.current.rotation.y += delta * 0.015;
      starsRef.current.rotation.x += delta * 0.005; // Add slight x-axis rotation for more dynamic feel
      
      // Access the point material to animate opacity for twinkling effect
      const material = starsRef.current.children[0].material;
      if (material) {
        // More pronounced twinkling effect
        material.opacity = 0.7 + Math.sin(state.clock.elapsedTime * 0.7) * 0.3;
        // Slightly animate the size for a more lively effect
        material.size = 0.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
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