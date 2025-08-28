'use client';

import { useRef } from 'react';

export default function TestPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="relative home-page-preserve">
      <div>Test</div>
    </div>
  );
}