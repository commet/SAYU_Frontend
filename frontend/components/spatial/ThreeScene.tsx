'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDimension, setCurrentDimension] = useState('central_hub');
  const router = useRouter();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 10, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);

    // Create Central Hub
    createCentralHub(scene);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      
      // Animate objects
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.animate) {
          child.rotation.y += 0.01;
          child.position.y = Math.sin(Date.now() * 0.001) * 0.5 + child.userData.baseY;
        }
      });

      composer.render();
    };

    animate();
    setIsLoading(false);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const createCentralHub = (scene: THREE.Scene) => {
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Create 16 animal guides in a circle
    const animalColors = [
      0xff6b35, 0x9d4edd, 0x8b5a3c, 0x52b788,
      0x95d5b2, 0xffd60a, 0xc77dff, 0xd4a373,
      0xf72585, 0x4cc9f0, 0x06ffa5, 0xffd166,
      0xef476f, 0xffd23f, 0x7209b7, 0xf77f00
    ];

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: animalColors[i],
        emissive: animalColors[i],
        emissiveIntensity: 0.3,
        metalness: 0.3,
        roughness: 0.4
      });

      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(x, 1, z);
      sphere.castShadow = true;
      sphere.userData.animate = true;
      sphere.userData.baseY = 1;
      scene.add(sphere);

      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: animalColors[i],
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(sphere.position);
      scene.add(glow);
    }

    // Create portals
    const portalPositions = [
      { pos: [15, 3, 0], rotation: [0, -Math.PI / 2, 0], color: 0x3b82f6 },
      { pos: [-15, 3, 0], rotation: [0, Math.PI / 2, 0], color: 0xa855f7 },
      { pos: [0, 3, 15], rotation: [0, 0, 0], color: 0xf59e0b },
      { pos: [0, 3, -15], rotation: [0, Math.PI, 0], color: 0xef4444 }
    ];

    portalPositions.forEach((portal) => {
      const portalGeometry = new THREE.BoxGeometry(4, 6, 0.5);
      const portalMaterial = new THREE.MeshStandardMaterial({
        color: portal.color,
        emissive: portal.color,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
      });

      const portalMesh = new THREE.Mesh(portalGeometry, portalMaterial);
      portalMesh.position.set(...portal.pos as [number, number, number]);
      portalMesh.rotation.set(...portal.rotation as [number, number, number]);
      scene.add(portalMesh);

      // Portal frame
      const frameGeometry = new THREE.BoxGeometry(4.5, 6.5, 0.3);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.copy(portalMesh.position);
      frame.rotation.copy(portalMesh.rotation);
      scene.add(frame);
    });

    // Add floating particles
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
  };

  return (
    <>
      <div ref={mountRef} className="w-full h-screen" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-white text-2xl">Loading 3D Gallery...</div>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/50 backdrop-blur-md rounded-2xl p-6 max-w-md pointer-events-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-2">SAYU 3D Gallery</h2>
          <p className="text-white/80">
            마우스로 회전하고 스크롤로 확대/축소할 수 있습니다.
          </p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => router.push('/home')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              퀴즈 시작하기
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </motion.div>
      </div>

      {/* Dimension indicator */}
      <div className="absolute bottom-8 left-8">
        <div className="bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
          <p className="text-white text-sm">Current: {currentDimension}</p>
        </div>
      </div>
    </>
  );
}