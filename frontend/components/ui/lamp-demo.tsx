"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

export function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

// SAYU-specific examples
export function SayuLampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-purple-300 to-pink-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        예술이 빛나는 <br /> 순간을 만나다
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 0.8, y: 0 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="text-slate-400 text-center mt-4 text-lg md:text-xl max-w-2xl"
      >
        SAYU와 함께 당신만의 예술 여정을 시작하세요
      </motion.p>
    </LampContainer>
  );
}

// APT Test intro version
export function APTLampDemo() {
  return (
    <LampContainer className="bg-black">
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-6"
      >
        <h1 className="bg-gradient-to-br from-amber-300 via-orange-400 to-red-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl">
          당신의 예술 성향을 <br /> 발견해보세요
        </h1>
        <p className="text-slate-400 text-center text-lg md:text-xl max-w-2xl">
          16가지 동물 캐릭터로 알아보는 Art Personality Test
        </p>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.6,
            duration: 0.5,
            ease: "easeOut",
          }}
          className="mt-4 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
        >
          테스트 시작하기
        </motion.button>
      </motion.div>
    </LampContainer>
  );
}