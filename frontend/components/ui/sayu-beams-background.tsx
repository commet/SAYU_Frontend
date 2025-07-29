"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { sayuColors } from "@/styles/design-system";
import { useAuth } from "@/hooks/useAuth";

interface SayuBeamsBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
    colorScheme?: "default" | "apt" | "emotion";
    aptType?: string;
    emotion?: string;
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    saturation: number;
    lightness: number;
    pulse: number;
    pulseSpeed: number;
}

function getBeamColors(colorScheme: string, aptType?: string, emotion?: string) {
    if (colorScheme === "apt" && aptType) {
        const theme = sayuColors.aptColors[aptType];
        if (theme) {
            // APT 색상을 HSL로 변환하는 로직
            return {
                hue: 0, // 실제로는 hex to hsl 변환 필요
                saturation: 70,
                lightness: 60
            };
        }
    }
    
    if (colorScheme === "emotion" && emotion) {
        // 감정 색상 활용
        return {
            hue: 340, // 감정별로 다르게
            saturation: 65,
            lightness: 55
        };
    }
    
    // 기본 SAYU 색상 (빨간색 계열)
    return {
        hue: 0, // 빨간색
        saturation: 70,
        lightness: 55
    };
}

function createBeam(width: number, height: number, baseColors: any): Beam {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 20 + Math.random() * 40, // 더 얇게
        length: height * 2,
        angle: angle,
        speed: 0.3 + Math.random() * 0.6, // 더 느리게
        opacity: 0.03 + Math.random() * 0.05, // 훨씬 더 은은하게
        hue: baseColors.hue + (Math.random() - 0.5) * 20,
        saturation: baseColors.saturation,
        lightness: baseColors.lightness,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.02,
    };
}

export function SayuBeamsBackground({
    className,
    children,
    intensity = "subtle",
    colorScheme = "default",
    aptType,
    emotion
}: SayuBeamsBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const { user } = useAuth();
    
    // 사용자 APT 타입 활용
    const userAptType = aptType || user?.profile?.typeCode;
    const MINIMUM_BEAMS = intensity === "subtle" ? 10 : intensity === "medium" ? 15 : 20;

    const opacityMap = {
        subtle: 0.3,
        medium: 0.5,
        strong: 0.7,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const baseColors = getBeamColors(colorScheme, userAptType, emotion);

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            beamsRef.current = Array.from({ length: MINIMUM_BEAMS }, () =>
                createBeam(canvas.width, canvas.height, baseColors)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;
            
            const column = index % 3;
            const spacing = canvas.width / 3;

            beam.y = canvas.height + 100;
            beam.x =
                column * spacing +
                spacing / 2 +
                (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 20 + Math.random() * 40;
            beam.speed = 0.3 + Math.random() * 0.5;
            beam.opacity = 0.03 + Math.random() * 0.05;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);

            // Calculate pulsing opacity
            const pulsingOpacity =
                beam.opacity *
                (0.8 + Math.sin(beam.pulse) * 0.2) *
                opacityMap[intensity];

            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);

            // Soft gradient with SAYU colors
            gradient.addColorStop(0, `hsla(${beam.hue}, ${beam.saturation}%, ${beam.lightness}%, 0)`);
            gradient.addColorStop(
                0.1,
                `hsla(${beam.hue}, ${beam.saturation}%, ${beam.lightness}%, ${pulsingOpacity * 0.3})`
            );
            gradient.addColorStop(
                0.5,
                `hsla(${beam.hue}, ${beam.saturation}%, ${beam.lightness}%, ${pulsingOpacity})`
            );
            gradient.addColorStop(
                0.9,
                `hsla(${beam.hue}, ${beam.saturation}%, ${beam.lightness}%, ${pulsingOpacity * 0.3})`
            );
            gradient.addColorStop(1, `hsla(${beam.hue}, ${beam.saturation}%, ${beam.lightness}%, 0)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = "blur(25px)"; // 더 부드럽게

            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                // Reset beam when it goes off screen
                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }

                drawBeam(ctx, beam);
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity, colorScheme, userAptType, emotion, MINIMUM_BEAMS]);

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden",
                className
            )}
        >
            {/* Canvas for beams */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ 
                    filter: "blur(20px)",
                    opacity: 0.6 
                }}
            />

            {/* Subtle animated overlay */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    opacity: [0.02, 0.05, 0.02],
                }}
                transition={{
                    duration: 15,
                    ease: "easeInOut",
                    repeat: Infinity,
                }}
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${
                        colorScheme === "apt" && userAptType
                            ? sayuColors.aptColors[userAptType]?.primary + '10'
                            : 'rgba(239, 68, 68, 0.05)'
                    }, transparent)`,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}