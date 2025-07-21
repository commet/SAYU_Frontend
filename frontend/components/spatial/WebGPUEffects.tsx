'use client';

import React, { useRef, useMemo } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom WebGPU-inspired Shader Material
const PortalShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#ff6b35'),
    uColorEnd: new THREE.Color('#7209b7'),
    uNoiseScale: 2.0,
    uNoiseStrength: 0.5,
    uDistortion: 0.3,
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uDistortion;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    // Noise function
    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }
    
    vec4 permute(vec4 x) {
      return mod289(((x*34.0)+10.0)*x);
    }
    
    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // Add noise-based displacement
      vec3 pos = position;
      float noise = snoise(vec3(position.x * 0.5, position.y * 0.5, uTime * 0.3));
      pos += normal * noise * uDistortion;
      
      vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectedPosition = projectionMatrix * viewPosition;
      
      gl_Position = projectedPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform float uNoiseScale;
    uniform float uNoiseStrength;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec2(0.0, i1.y ))
      + i.x + vec2(0.0, i1.x ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      // Create flowing noise pattern
      vec2 noiseCoord = vUv * uNoiseScale + vec2(uTime * 0.1, -uTime * 0.15);
      float noise = snoise(noiseCoord) * 0.5 + 0.5;
      
      // Create swirling pattern
      vec2 center = vec2(0.5, 0.5);
      vec2 uv = vUv - center;
      float angle = atan(uv.y, uv.x);
      float radius = length(uv);
      
      // Spiral distortion
      angle += uTime * 0.5 + radius * 3.0;
      vec2 spiralUv = vec2(cos(angle), sin(angle)) * radius + center;
      
      // Mix colors based on noise and spiral
      float mixValue = noise * uNoiseStrength + (1.0 - uNoiseStrength) * spiralUv.x;
      vec3 color = mix(uColorStart, uColorEnd, mixValue);
      
      // Add glow effect
      float glow = 1.0 - radius * 2.0;
      glow = clamp(glow, 0.0, 1.0);
      glow = pow(glow, 2.0);
      
      color += vec3(glow * 0.5);
      
      // Fresnel effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = 1.0 - dot(viewDirection, vNormal);
      fresnel = pow(fresnel, 2.0);
      
      color += fresnel * 0.3;
      
      // Output with alpha
      float alpha = smoothstep(0.5, 0.48, radius) * (0.8 + noise * 0.2);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ PortalShaderMaterial });

// Particle System with WebGPU-style compute shader simulation
export function ParticleField({ count = 5000 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const shader = useRef<any>();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      // Color
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Size
      sizes[i] = Math.random() * 0.5 + 0.1;

      // Velocity
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    return { positions, colors, sizes, velocities };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;

    const positions = mesh.current.geometry.attributes.position.array as Float32Array;
    const velocities = particles.velocities;
    const time = state.clock.elapsedTime;

    // Simulate particle movement (WebGPU compute shader style)
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update position based on velocity
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1] + Math.sin(time + i) * 0.001;
      positions[i3 + 2] += velocities[i3 + 2];

      // Boundary check and wrap
      if (positions[i3] > 25) positions[i3] = -25;
      if (positions[i3] < -25) positions[i3] = 25;
      if (positions[i3 + 1] > 20) positions[i3 + 1] = 0;
      if (positions[i3 + 1] < 0) positions[i3 + 1] = 20;
      if (positions[i3 + 2] > 25) positions[i3 + 2] = -25;
      if (positions[i3 + 2] < -25) positions[i3 + 2] = 25;

      // Add some wave motion
      positions[i3 + 1] += Math.sin(time * 0.5 + positions[i3] * 0.1) * 0.005;
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;

    if (shader.current) {
      shader.current.uniforms.uTime.value = time;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shader}
        vertexShader={`
          attribute float size;
          varying vec3 vColor;
          uniform float uTime;
          
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + sin(uTime + position.x) * 0.2);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;
          
          void main() {
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (r > 0.5) discard;
            
            float intensity = 1.0 - (r * 2.0);
            intensity = pow(intensity, 3.0);
            
            gl_FragColor = vec4(vColor * intensity, intensity);
          }
        `}
        uniforms={{
          uTime: { value: 0 }
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

// Volumetric Light Effect
export function VolumetricLight({ position = [0, 10, 0] }: { position?: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current && mesh.current.material) {
      (mesh.current.material as any).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <coneGeometry args={[5, 20, 32, 1, true]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec3 vPosition;
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          float noise(vec2 p) {
            return sin(p.x * 10.0 + uTime) * sin(p.y * 10.0 + uTime) * 0.5 + 0.5;
          }
          
          void main() {
            float intensity = 1.0 - vUv.y;
            intensity = pow(intensity, 3.0);
            
            float n = noise(vUv * 5.0) * 0.3 + 0.7;
            intensity *= n;
            
            vec3 color = vec3(0.8, 0.9, 1.0);
            
            gl_FragColor = vec4(color * intensity, intensity * 0.3);
          }
        `}
        uniforms={{
          uTime: { value: 0 }
        }}
      />
    </mesh>
  );
}

// Portal Effect Component
export function PortalEffect({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  colorStart = '#ff6b35',
  colorEnd = '#7209b7'
}: { 
  position?: [number, number, number];
  rotation?: [number, number, number];
  colorStart?: string;
  colorEnd?: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current && mesh.current.material) {
      (mesh.current.material as any).uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <planeGeometry args={[4, 6, 64, 64]} />
      <portalShaderMaterial
        transparent
        side={THREE.DoubleSide}
        uColorStart={new THREE.Color(colorStart)}
        uColorEnd={new THREE.Color(colorEnd)}
      />
    </mesh>
  );
}

// Export all effects
export default {
  ParticleField,
  VolumetricLight,
  PortalEffect,
  PortalShaderMaterial
};