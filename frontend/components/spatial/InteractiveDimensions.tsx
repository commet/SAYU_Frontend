'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  Box, 
  Sphere, 
  Text3D, 
  Center, 
  Float, 
  Html,
  useTexture,
  MeshReflectorMaterial,
  softShadows,
  ContactShadows,
  Environment,
  Lightformer
} from '@react-three/drei';
import * as THREE from 'three';
// Removed framer-motion/three - using native Three.js animations
import { ParticleField, VolumetricLight } from './WebGPUEffects';

// Soft shadows config
softShadows({
  frustum: 3.75,
  size: 0.005,
  near: 9.5,
  samples: 17,
  rings: 11
});

// Personality Lab Dimension
export function PersonalityLabDimension() {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const roomRef = useRef<THREE.Group>(null);

  // Quiz questions floating in 3D space
  const questions = [
    {
      text: "갤러리에서 가장 먼저 향하는 곳은?",
      options: [
        { text: "고요한 단색화", color: "#4a5568" },
        { text: "화려한 팝아트", color: "#ed64a6" },
        { text: "깊이있는 풍경화", color: "#38b2ac" },
        { text: "추상적인 현대미술", color: "#9f7aea" }
      ]
    }
  ];

  useFrame((state) => {
    if (roomRef.current) {
      roomRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group ref={roomRef}>
      {/* Lab Environment */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={2}
          position={[0, 5, -10]}
          scale={[10, 10, 1]}
          onUpdate={(self) => self.lookAt(0, 0, 0)}
        />
        <Lightformer
          form="circle"
          intensity={1}
          position={[-5, 5, -5]}
          scale={[2, 2, 1]}
          target={[0, 0, 0]}
        />
      </Environment>

      {/* Holographic Display */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, 3, 0]}>
          <Box args={[8, 4, 0.1]}>
            <meshPhysicalMaterial
              color="#00ffff"
              emissive="#00ffff"
              emissiveIntensity={0.5}
              metalness={0}
              roughness={0}
              transmission={0.9}
              thickness={0.5}
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={0}
            />
          </Box>
          
          <Html position={[0, 0, 0.1]} transform occlude>
            <div className="bg-black/80 backdrop-blur-xl p-6 rounded-xl text-white w-[400px]">
              <h3 className="text-2xl font-bold mb-4">{questions[activeQuestion].text}</h3>
              <div className="grid grid-cols-2 gap-3">
                {questions[activeQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className="p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/20"
                    onClick={() => console.log('Selected:', option.text)}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </Html>
        </group>
      </Float>

      {/* Floating Question Orbs */}
      {questions[activeQuestion].options.map((option, index) => {
        const angle = (index / 4) * Math.PI * 2;
        const x = Math.cos(angle) * 5;
        const z = Math.sin(angle) * 5;
        
        return (
          <Float key={index} speed={3} rotationIntensity={1} floatIntensity={0.5}>
            <Sphere
              args={[1, 32, 32]}
              position={[x, 2, z]}
            >
              <meshPhysicalMaterial
                color={option.color}
                emissive={option.color}
                emissiveIntensity={0.5}
                metalness={0.5}
                roughness={0.1}
                envMapIntensity={1}
              />
            </Sphere>
          </Float>
        );
      })}

      {/* Reflective Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[1000, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#101010"
          metalness={0.5}
        />
      </mesh>

      {/* Particle Effects */}
      <ParticleField count={1000} />
      
      {/* Contact Shadows */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.5}
        scale={50}
        blur={2}
        far={10}
      />
    </group>
  );
}

// Art Studio Dimension
export function ArtStudioDimension() {
  const canvasRef = useRef<THREE.Mesh>(null);
  const [brushStrokes, setBrushStrokes] = useState<Array<{id: string, position: [number, number, number], color: string}>>([]);

  const handleCanvasClick = (event: any) => {
    const newStroke = {
      id: Math.random().toString(),
      position: event.point as [number, number, number],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    setBrushStrokes([...brushStrokes, newStroke]);
  };

  return (
    <group>
      {/* Studio Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff9966" />
      
      {/* Canvas */}
      <group position={[0, 3, -5]}>
        <Box 
          ref={canvasRef}
          args={[8, 6, 0.2]} 
          onClick={handleCanvasClick}
        >
          <meshStandardMaterial color="white" />
        </Box>
        
        {/* Brush Strokes */}
        {brushStrokes.map((stroke) => (
          <mesh
            key={stroke.id}
            position={stroke.position}
            scale={1}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial 
              color={stroke.color}
              emissive={stroke.color}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Paint Palette */}
      <Float speed={2} rotationIntensity={0.5}>
        <group position={[5, 2, 0]}>
          {['#ff6b35', '#f7931e', '#ffd23f', '#06ffa5', '#4cc9f0', '#7209b7'].map((color, index) => {
            const angle = (index / 6) * Math.PI * 2;
            const x = Math.cos(angle) * 0.8;
            const z = Math.sin(angle) * 0.8;
            
            return (
              <Sphere key={index} args={[0.3, 16, 16]} position={[x, 0, z]}>
                <meshStandardMaterial 
                  color={color}
                  metalness={0.3}
                  roughness={0.4}
                />
              </Sphere>
            );
          })}
        </group>
      </Float>

      {/* Easel */}
      <group position={[0, 0, -3]}>
        <Box args={[0.1, 4, 0.1]} position={[-1, 2, 0]} rotation={[0, 0, 0.1]}>
          <meshStandardMaterial color="#8b4513" />
        </Box>
        <Box args={[0.1, 4, 0.1]} position={[1, 2, 0]} rotation={[0, 0, -0.1]}>
          <meshStandardMaterial color="#8b4513" />
        </Box>
        <Box args={[2.5, 0.1, 0.1]} position={[0, 2, 0]}>
          <meshStandardMaterial color="#8b4513" />
        </Box>
      </group>

      {/* Studio Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#d4a373"
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Volumetric Lighting */}
      <VolumetricLight position={[0, 10, 0]} />
    </group>
  );
}

// Gallery Hall Dimension
export function GalleryHallDimension() {
  const artworks = useMemo(() => [
    { id: 1, position: [-8, 3, -10], size: [4, 5, 0.2], color: '#ff6b35', title: 'Sunset Dreams' },
    { id: 2, position: [0, 3, -10], size: [4, 5, 0.2], color: '#4cc9f0', title: 'Ocean Memories' },
    { id: 3, position: [8, 3, -10], size: [4, 5, 0.2], color: '#06ffa5', title: 'Spring Awakening' },
    { id: 4, position: [-8, 3, 10], size: [4, 5, 0.2], color: '#f7931e', title: 'Golden Hour' },
    { id: 5, position: [0, 3, 10], size: [4, 5, 0.2], color: '#7209b7', title: 'Mystic Portal' },
    { id: 6, position: [8, 3, 10], size: [4, 5, 0.2], color: '#f72585', title: 'Love\'s Embrace' }
  ], []);

  return (
    <group>
      {/* Gallery Lighting */}
      <ambientLight intensity={0.3} />
      {artworks.map((artwork, index) => (
        <spotLight
          key={index}
          position={[artwork.position[0], 8, artwork.position[2]]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
          target-position={artwork.position}
        />
      ))}

      {/* Artworks */}
      {artworks.map((artwork) => (
        <Float key={artwork.id} speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <group position={artwork.position as [number, number, number]}>
            {/* Frame */}
            <Box args={[artwork.size[0] + 0.4, artwork.size[1] + 0.4, artwork.size[2] + 0.1]}>
              <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
            </Box>
            
            {/* Artwork */}
            <Box args={artwork.size as [number, number, number]} position={[0, 0, 0.1]}>
              <meshStandardMaterial 
                color={artwork.color}
                emissive={artwork.color}
                emissiveIntensity={0.2}
              />
            </Box>
            
            {/* Title Plaque */}
            <Html position={[0, -3.5, 0]} center>
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded shadow-lg">
                <p className="text-sm font-semibold text-gray-800">{artwork.title}</p>
              </div>
            </Html>
          </group>
        </Float>
      ))}

      {/* Gallery Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={50}
          roughness={0.8}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#faf5f0"
          metalness={0}
        />
      </mesh>

      {/* Gallery Walls */}
      <mesh position={[0, 5, -15]} receiveShadow>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#faf5f0" />
      </mesh>
      <mesh position={[0, 5, 15]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#faf5f0" />
      </mesh>
      <mesh position={[-25, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#faf5f0" />
      </mesh>
      <mesh position={[25, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#faf5f0" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 30]} />
        <meshStandardMaterial color="#faf5f0" />
      </mesh>
    </group>
  );
}

// Community Lounge Dimension
export function CommunityLoungeDimension() {
  const [avatars, setAvatars] = useState([
    { id: 1, position: [-3, 0, -3], color: '#ff6b35', name: 'Fox' },
    { id: 2, position: [3, 0, -3], color: '#4cc9f0', name: 'Penguin' },
    { id: 3, position: [-3, 0, 3], color: '#06ffa5', name: 'Parrot' },
    { id: 4, position: [3, 0, 3], color: '#7209b7', name: 'Elephant' }
  ]);

  return (
    <group>
      {/* Cozy Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffd700" />
      
      {/* Central Meeting Area */}
      <group position={[0, 0, 0]}>
        {/* Round Table */}
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[3, 3, 0.2, 32]} />
          <meshStandardMaterial color="#8b4513" />
        </mesh>
        
        {/* Seats */}
        {avatars.map((avatar, index) => {
          const angle = (index / 4) * Math.PI * 2;
          const x = Math.cos(angle) * 4;
          const z = Math.sin(angle) * 4;
          
          return (
            <Float key={avatar.id} speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
              <group position={[x, 0, z]}>
                <Sphere args={[0.8, 32, 32]}>
                  <meshStandardMaterial 
                    color={avatar.color}
                    emissive={avatar.color}
                    emissiveIntensity={0.3}
                  />
                </Sphere>
                <Html position={[0, 1.5, 0]} center>
                  <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm">
                    {avatar.name}
                  </div>
                </Html>
              </group>
            </Float>
          );
        })}
      </group>

      {/* Shared Display Board */}
      <group position={[0, 5, -8]}>
        <Box args={[10, 6, 0.3]}>
          <meshStandardMaterial color="#2d3748" />
        </Box>
        <Html position={[0, 0, 0.2]} transform>
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-xl w-[500px] shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Community Board</h3>
            <div className="space-y-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <p className="font-semibold">Fox님이 새로운 전시를 추천했습니다</p>
                <p className="text-sm text-gray-600">모네 특별전 - 국립현대미술관</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <p className="font-semibold">Penguin님이 감상평을 공유했습니다</p>
                <p className="text-sm text-gray-600">추상화의 매력에 빠져들다...</p>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* Cozy Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#d4a373"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Warm Particle Effects */}
      <ParticleField count={500} />
    </group>
  );
}