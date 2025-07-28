"use client";

// this is a client component
import { useEffect } from "react";
import Link from "next/link";
import { renderCanvas } from "@/components/ui/canvas"
import { Plus, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <section id="home">
      <div className="animation-delay-8 animate-fadeIn mt-20 flex  flex-col items-center justify-center px-4 text-center md:mt-20">
        <div className="z-10 mb-6 mt-10 sm:justify-center md:mb-4 md:mt-20">
          <div className="relative flex items-center whitespace-nowrap rounded-full border bg-popover px-3 py-1 text-xs leading-6  text-primary/60 ">
            <Sparkles className="h-5 p-1" /> Introducing SAYU APT.
            <a
              href="/apt-test"
              rel="noreferrer"
              className="hover:text-primary ml-1 flex items-center font-semibold"
            >
              <div className="absolute inset-0 flex" aria-hidden="true" />
              Explore{" "}
              <span aria-hidden="true">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>

        <div className="mb-10 mt-4  md:mt-6">
          <div className="px-2">
            <div className="border-primary relative mx-auto h-full max-w-7xl border p-6 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-20">
              <h1 className="flex  select-none flex-col  px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:flex-row lg:text-8xl">
                <Plus
                  strokeWidth={4}
                  className="text-primary absolute -left-5 -top-5 h-10 w-10"
                />
                <Plus
                  strokeWidth={4}
                  className="text-primary absolute -bottom-5 -left-5 h-10 w-10"
                />
                <Plus
                  strokeWidth={4}
                  className="text-primary absolute -right-5 -top-5 h-10 w-10"
                />
                <Plus
                  strokeWidth={4}
                  className="text-primary absolute -bottom-5 -right-5 h-10 w-10"
                />
                Your complete platform for Art Discovery.
              </h1>
              <div className="flex items-center justify-center gap-1">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-500">Available Now</p>
              </div>
            </div>
          </div>

          <h1 className="mt-8 text-2xl md:text-2xl">
            Welcome to SAYU! Discover art that matches{" "}
            <span className="text-primary font-bold">your personality</span>
          </h1>

          <p className="md:text-md mx-auto mb-16 mt-2 max-w-2xl px-6 text-sm text-primary/60 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg">
            AI-powered art recommendations based on your unique personality type. 
            Connect with like-minded art lovers and discover your next favorite exhibition.
          </p>
          <div className="flex justify-center gap-2">
            <Link href={"/apt-test"}>
              <Button variant="default" size="lg">
                Take APT Test
              </Button>
            </Link>
            <Link href={"/gallery"}>
              <Button variant="outline" size="lg">
                Browse Gallery
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <canvas
        className="bg-background pointer-events-none absolute inset-0 mx-auto"
        id="canvas"
      ></canvas>
    </section>
  );
}

// SAYU-specific canvas hero
export function SayuCanvasHero() {
  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          예술과 당신을 <br />
          <span className="text-primary">연결하는 SAYU</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI가 분석한 당신의 성격 유형으로 맞춤 예술 경험을 제공합니다
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 py-6">
            APT 테스트 시작하기
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6">
            갤러리 둘러보기
          </Button>
        </div>
      </div>
      <canvas
        className="absolute inset-0 pointer-events-none"
        id="canvas"
      ></canvas>
    </section>
  );
}