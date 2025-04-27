import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const HoloThreeEffect = ({ className = '', style = {}, intensity = 1 }) => {
  const mountRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Create renderer with explicit context
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 128, 16);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x00ffe7,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      transmission: 0.8,
      ior: 1.4,
      thickness: 0.8,
      emissive: 0x00ffe7,
      emissiveIntensity: 0.5 * intensity,
      opacity: 0.7,
      transparent: true,
    });
    
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // Handle window resize
    const handleResize = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(newWidth, newHeight);
    };
    
    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);
      knot.rotation.x += 0.01 * intensity;
      knot.rotation.y += 0.013 * intensity;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [intensity]);

  return <div ref={mountRef} className={`holo-three-effect ${className}`} style={{ width: '100%', height: '220px', ...style }} />;
};

export default HoloThreeEffect;
