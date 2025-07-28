import React from 'react';

// Ensure this import path is correct for your project structure
import SectionWithMockup from "@/components/ui/section-with-mockup"

// Data for the first section (default layout)
const exampleData1 = {
    title: (
        <>
            Intelligence,
            <br />
            delivered to you.
        </>
    ),
    description: (
        <>
            Get a tailored Monday morning brief directly in
            <br />
            your inbox, crafted by your virtual personal
            <br />
            analyst, spotlighting essential watchlist stories
            <br />
            and earnings for the week ahead.
        </>
    ),
    primaryImageSrc: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=1200&fit=crop',
    secondaryImageSrc: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1200&fit=crop',
};

// SAYU-specific example data
const sayuExample = {
    title: (
        <>
            예술과 당신을
            <br />
            연결하는 SAYU
        </>
    ),
    description: (
        <>
            AI가 분석한 당신의 성격 유형을 바탕으로
            <br />
            맞춤형 예술 작품과 전시를 추천받고,
            <br />
            비슷한 취향의 사람들과 함께
            <br />
            더 깊은 예술 경험을 만들어보세요.
        </>
    ),
    primaryImageSrc: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1200&fit=crop',
    secondaryImageSrc: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=1200&fit=crop',
};

// Changed from 'export default function ...' to 'export function ...'
export function SectionMockupDemoPage() {
    return (
        <div className="bg-black">
            {/* Default layout */}
            <SectionWithMockup
                title={exampleData1.title}
                description={exampleData1.description}
                primaryImageSrc={exampleData1.primaryImageSrc}
                secondaryImageSrc={exampleData1.secondaryImageSrc}
            />
            
            {/* Reversed layout with SAYU content */}
            <SectionWithMockup
                title={sayuExample.title}
                description={sayuExample.description}
                primaryImageSrc={sayuExample.primaryImageSrc}
                secondaryImageSrc={sayuExample.secondaryImageSrc}
                reverseLayout={true}
            />
        </div>
    );
}