'use client';

/* @ts-nocheck */

import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  OrbitControls, 
  Environment,
  Float,
  Text3D,
  Center,
  useGLTF,
  Html,
  Loader,
  useProgress,
  Sky,
  Stars,
  Cloud,
  Sparkles,
  MeshPortalMaterial,
  RoundedBox,
  Edges
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SpatialNavigator, { SAYU_DIMENSIONS } from '@/lib/spatial-architecture';
import useAnimationStore from '@/lib/animation-system';
import useThemeStore from '@/lib/unified-theme-system';
// Dynamic imports for heavy 3D dimension components
const PersonalityLabDimension = lazy(() => import('./InteractiveDimensions').then(mod => ({ default: mod.PersonalityLabDimension })));
const ArtStudioDimension = lazy(() => import('./InteractiveDimensions').then(mod => ({ default: mod.ArtStudioDimension })));
const GalleryHallDimension = lazy(() => import('./InteractiveDimensions').then(mod => ({ default: mod.GalleryHallDimension })));
const CommunityLoungeDimension = lazy(() => import('./InteractiveDimensions').then(mod => ({ default: mod.CommunityLoungeDimension })));
import { ParticleField, VolumetricLight, PortalEffect } from './WebGPUEffects';
// Dynamic imports for heavy 3D components
const AICuratorAvatar = lazy(() => import('./AICuratorAvatar').then(mod => ({ default: mod.AICuratorAvatar })));
const AICurator3DChat = lazy(() => import('./AICuratorAvatar').then(mod => ({ default: mod.AICurator3DChat })));

// Portal Component
function Portal({ 
  dimension, 
  position, 
  rotation, 
  onEnter 
}: { 
  dimension: any; 
  position: [number, number, number];
  rotation: [number, number, number];
  onEnter: () => void;
}) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      <RoundedBox
        ref={meshRef}
        args={[4, 6, 0.5]}
        radius={0.3}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onEnter}
      >
        <MeshPortalMaterial side={THREE.DoubleSide}>
          <ambientLight intensity={0.5} />
          <Environment preset="sunset" />
          {/* Portal content preview */}
          <mesh>
            <sphereGeometry args={[5, 64, 64]} />
            <meshStandardMaterial 
              color={dimension.environment.lighting === 'warm_museum_lighting' ? '#ff9966' : '#6699ff'} 
              emissive={dimension.environment.lighting === 'warm_museum_lighting' ? '#ff6633' : '#3366ff'}
              emissiveIntensity={0.5}
            />
          </mesh>
          <Sparkles 
            count={100} 
            scale={10} 
            size={3} 
            speed={0.5} 
            color={dimension.environment.lighting === 'warm_museum_lighting' ? '#ffaa44' : '#4488ff'}
          />
        </MeshPortalMaterial>
        <Edges color={hovered ? '#ffffff' : '#666666'} />
      </RoundedBox>
      
      <Html position={[0, -4, 0]} center>
        <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg">
          <h3 className="font-bold text-lg">{dimension.name}</h3>
          <p className="text-sm opacity-80">{dimension.purpose}</p>
        </div>
      </Html>
    </group>
  );
}

// Animal Guide Component
function AnimalGuide({ 
  type, 
  position,
  onClick 
}: { 
  type: string; 
  position: [number, number, number];
  onClick: () => void;
}) {
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      if (hovered) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  const animalColors: Record<string, string> = {
    fox: '#ff6b35',
    cat: '#9d4edd',
    owl: '#8b5a3c',
    turtle: '#52b788',
    chameleon: '#95d5b2',
    hedgehog: '#ffd60a',
    octopus: '#c77dff',
    beaver: '#d4a373',
    butterfly: '#f72585',
    penguin: '#4cc9f0',
    parrot: '#06ffa5',
    deer: '#ffd166',
    dog: '#ef476f',
    duck: '#ffd23f',
    elephant: '#7209b7',
    eagle: '#f77f00'
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group 
        ref={meshRef}
        position={position}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={onClick}
      >
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            color={animalColors[type.toLowerCase()] || '#ffffff'}
            emissive={animalColors[type.toLowerCase()] || '#ffffff'}
            emissiveIntensity={hovered ? 0.5 : 0.2}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        
        <Html position={[0, -2, 0]} center>
          <div className={`transition-all duration-300 ${hovered ? 'opacity-100 scale-110' : 'opacity-80 scale-100'}`}>
            <div className="bg-white/90 backdrop-blur-md text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              {type}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

// Main Scene Component
function SpatialScene() {
  const { camera } = useThree();
  const router = useRouter();
  const [currentDimension, setCurrentDimension] = useState('CENTRAL_HUB');
  const [showAIChat, setShowAIChat] = useState(false);
  const navigator = useRef(new SpatialNavigator());
  const { playAnimation } = useAnimationStore();
  const { mode } = useThemeStore();

  const handlePortalEnter = async (dimensionId: string) => {
    await playAnimation('portal-transition', camera, {
      onComplete: () => {
        setCurrentDimension(dimensionId);
        navigator.current.transitionTo(dimensionId);
      }
    });
  };

  const handleAnimalClick = (animalType: string) => {
    router.push(`/personality-types?animal=${animalType}`);
  };

  const dimension = SAYU_DIMENSIONS[currentDimension];

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={mode === 'dark' ? 0.2 : 0.4} />
      <directionalLight position={[10, 10, 5]} intensity={mode === 'dark' ? 0.8 : 1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff9966" />
      
      {/* Environment */}
      {currentDimension === 'CENTRAL_HUB' && (
        <>
          <Sky 
            distance={450000} 
            sunPosition={[100, 20, 100]} 
            inclination={0.6} 
            azimuth={0.25}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
      )}
      
      {/* Gallery Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color={mode === 'dark' ? '#1a1a1a' : '#f5f5f5'} 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Dimension-specific Content */}
      {currentDimension === 'CENTRAL_HUB' && (
        <>
          {/* Title */}
          <Center position={[0, 8, -10]}>
            <Text3D
              font="/fonts/Playfair_Display_Bold.json"
              size={2}
              height={0.5}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.1}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
            >
              SAYU Gallery
              <meshStandardMaterial color="#ff6b35" emissive="#ff3300" emissiveIntensity={0.2} />
            </Text3D>
          </Center>

          {/* Animal Guides Circle */}
          {Object.entries({
            fox: 'Fox', cat: 'Cat', owl: 'Owl', turtle: 'Turtle',
            chameleon: 'Chameleon', hedgehog: 'Hedgehog', octopus: 'Octopus', beaver: 'Beaver',
            butterfly: 'Butterfly', penguin: 'Penguin', parrot: 'Parrot', deer: 'Deer',
            dog: 'Dog', duck: 'Duck', elephant: 'Elephant', eagle: 'Eagle'
          }).map(([key, name], index) => {
            const angle = (index / 16) * Math.PI * 2;
            const radius = 8;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            return (
              <AnimalGuide
                key={key}
                type={name}
                position={[x, 1, z]}
                onClick={() => handleAnimalClick(key)}
              />
            );
          })}

          {/* Portals to Other Dimensions */}
          <Portal
            dimension={SAYU_DIMENSIONS.PERSONALITY_LAB}
            position={[15, 3, 0]}
            rotation={[0, -Math.PI / 2, 0]}
            onEnter={() => handlePortalEnter('PERSONALITY_LAB')}
          />
          
          <Portal
            dimension={SAYU_DIMENSIONS.ART_STUDIO}
            position={[-15, 3, 0]}
            rotation={[0, Math.PI / 2, 0]}
            onEnter={() => handlePortalEnter('ART_STUDIO')}
          />
          
          <Portal
            dimension={SAYU_DIMENSIONS.GALLERY_HALL}
            position={[0, 3, 15]}
            rotation={[0, 0, 0]}
            onEnter={() => handlePortalEnter('GALLERY_HALL')}
          />
          
          <Portal
            dimension={SAYU_DIMENSIONS.COMMUNITY_LOUNGE}
            position={[0, 3, -15]}
            rotation={[0, Math.PI, 0]}
            onEnter={() => handlePortalEnter('COMMUNITY_LOUNGE')}
          />
        </>
      )}
      
      {currentDimension === 'PERSONALITY_LAB' && (
        <Suspense fallback={null}>
          <PersonalityLabDimension />
        </Suspense>
      )}
      {currentDimension === 'ART_STUDIO' && (
        <Suspense fallback={null}>
          <ArtStudioDimension />
        </Suspense>
      )}
      {currentDimension === 'GALLERY_HALL' && (
        <Suspense fallback={null}>
          <GalleryHallDimension />
        </Suspense>
      )}
      {currentDimension === 'COMMUNITY_LOUNGE' && (
        <Suspense fallback={null}>
          <CommunityLoungeDimension />
        </Suspense>
      )}

      {/* AI Curator Avatar */}
      <Suspense fallback={null}>
        <AICuratorAvatar 
          position={[10, 3, 10]} 
          onInteraction={() => setShowAIChat(true)}
        />
      </Suspense>
      
      {/* AI Chat Interface */}
      {showAIChat && (
        <Suspense fallback={null}>
          <AICurator3DChat onClose={() => setShowAIChat(false)} />
        </Suspense>
      )}
      
      {/* Floating Particles */}
      <Sparkles count={200} scale={50} size={2} speed={0.3} opacity={0.5} />
      
      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
        <Vignette eskil={false} offset={0.1} darkness={mode === 'dark' ? 0.8 : 0.5} />
      </EffectComposer>
    </>
  );
}

// Loading Component
function LoadingScreen() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="text-4xl font-bold text-white mb-4">Loading SAYU Gallery</div>
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-white mt-2">{Math.round(progress)}%</div>
      </div>
    </Html>
  );
}

// Main Component
export default function SpatialNavigation() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Initializing 3D Space...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows camera={{ position: [0, 5, 20], fov: 60 }}>
        <Suspense fallback={<LoadingScreen />}>
          <PerspectiveCamera makeDefault position={[0, 5, 20]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={5}
            maxDistance={50}
          />
          <SpatialScene />
        </Suspense>
      </Canvas>
      
      <Loader />
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black/50 backdrop-blur-md rounded-2xl p-6 max-w-md pointer-events-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to SAYU Gallery</h2>
          <p className="text-white/80">
            Explore our immersive 3D space. Click on animal guides or portals to navigate.
          </p>
        </motion.div>
      </div>
    </div>
  );
}