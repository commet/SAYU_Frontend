"use client"

import * as React from "react"
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
} from "@/components/ui/image-comparison"

export function BasicDemo() {
  return (
    <ImageComparison className="aspect-[16/10] w-full rounded-lg border border-zinc-200 dark:border-zinc-800">
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=1600&h=1000&fit=crop"
        alt="Art Gallery Dark Lighting"
        position="left"
      />
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=1600&h=1000&fit=crop"
        alt="Art Gallery Bright Lighting"
        position="right"
      />
      <ImageComparisonSlider className="bg-white" />
    </ImageComparison>
  )
}

export function HoverDemo() {
  return (
    <ImageComparison
      className="aspect-[16/10] w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
      enableHover
    >
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1600&h=1000&fit=crop"
        alt="Classic Art Style"
        position="left"
      />
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1600&h=1000&fit=crop"
        alt="Modern Art Style"
        position="right"
      />
      <ImageComparisonSlider className="bg-white" />
    </ImageComparison>
  )
}

export function SpringDemo() {
  return (
    <ImageComparison
      className="aspect-[16/10] w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
      enableHover
      springOptions={{
        bounce: 0.3,
      }}
    >
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1600&h=1000&fit=crop"
        alt="Artwork Original"
        position="left"
      />
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1569172122301-bc5008bc09c5?w=1600&h=1000&fit=crop"
        alt="Artwork Enhanced"
        position="right"
      />
      <ImageComparisonSlider className="w-0.5 bg-white/30 backdrop-blur-sm" />
    </ImageComparison>
  )
}

export function CustomSliderDemo() {
  return (
    <ImageComparison className="aspect-[16/10] w-full rounded-lg border border-zinc-200 dark:border-zinc-800">
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1600&h=1000&fit=crop"
        alt="Museum Interior Dark"
        position="left"
      />
      <ImageComparisonImage
        src="https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1600&h=1000&fit=crop"
        alt="Museum Interior Light"
        position="right"
      />
      <ImageComparisonSlider className="w-2 bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/80">
        <div className="absolute left-1/2 top-1/2 h-8 w-6 -translate-x-1/2 -translate-y-1/2 rounded-[4px] bg-white" />
      </ImageComparisonSlider>
    </ImageComparison>
  )
}

export const demos = [
  {
    name: "Basic",
    description: "Basic image comparison with default settings",
    component: BasicDemo,
  },
  {
    name: "Hover",
    description: "Image comparison with hover interaction enabled",
    component: HoverDemo,
  },
  {
    name: "Spring Animation",
    description: "Image comparison with spring animation effect",
    component: SpringDemo,
  },
  {
    name: "Custom Slider",
    description: "Image comparison with custom slider design",
    component: CustomSliderDemo,
  }
]