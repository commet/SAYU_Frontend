'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { generatePersonalizedTheme, applyThemeToDOM } from '@/lib/themes';
import { PersonalizedCard, PersonalizedButton, PersonalizedGrid } from './personalized-components';
import { Palette, Eye, RefreshCw } from 'lucide-react';

// Demo component to preview different themes
export function ThemePreviewDemo() {
  const [currentDemo, setCurrentDemo] = useState('AGE_001');

  const demoTypes = [
    { code: 'AGE_001', name: 'Abstract • Social • Emotional • Modern', description: 'Creative, Social, Intuitive, Contemporary' },
    { code: 'RGA_002', name: 'Realistic • Social • Analytical • Classical', description: 'Practical, Social, Loneal, Traditional' },
    { code: 'AIE_003', name: 'Abstract • Personal • Emotional • Classical', description: 'Creative, Individual, Intuitive, Traditional' },
    { code: 'RIM_004', name: 'Realistic • Personal • Analytical • Modern', description: 'Practical, Individual, Loneal, Contemporary' }
  ];

  const previewTheme = (typeCode: string) => {
    setCurrentDemo(typeCode);
    const demoType = demoTypes.find(t => t.code === typeCode);
    const theme = generatePersonalizedTheme(typeCode, demoType?.name || 'Demo User');
    applyThemeToDOM(theme);
  };

  return (
    <PersonalizedCard>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Palette className="w-6 h-6 mr-3" />
          <h3 className="text-xl font-bold">Theme Preview Demo</h3>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm opacity-75">
            Experience how SAYU adapts to different aesthetic personalities:
          </p>
          
          <PersonalizedGrid columns={2} gap="sm">
            {demoTypes.map((demo) => (
              <PersonalizedButton
                key={demo.code}
                variant={currentDemo === demo.code ? 'primary' : 'outline'}
                size="sm"
                onClick={() => previewTheme(demo.code)}
              >
                <div className="text-left">
                  <div className="font-mono text-xs">{demo.code}</div>
                  <div className="text-xs opacity-75">{demo.description}</div>
                </div>
              </PersonalizedButton>
            ))}
          </PersonalizedGrid>
        </div>

        <div className="text-center">
          <PersonalizedButton
            variant="ghost"
            size="sm"
            onClick={() => {
              // Reset to user's actual theme
              window.location.reload();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Your Theme
          </PersonalizedButton>
        </div>
      </div>
    </PersonalizedCard>
  );
}

// Show theme information for current user
export function CurrentThemeInfo() {
  return (
    <PersonalizedCard>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Eye className="w-5 h-5 mr-2" />
          <h4 className="font-semibold">Your Current Theme</h4>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Background</span>
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: 'var(--color-background)' }}
              title="Background Color"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Primary</span>
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: 'var(--color-primary)' }}
              title="Primary Color"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Accent</span>
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: 'var(--color-accent)' }}
              title="Accent Color"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Gradient</span>
            <div 
              className="w-6 h-6 rounded border"
              style={{ background: 'var(--color-gradient)' }}
              title="Gradient"
            />
          </div>
        </div>
      </div>
    </PersonalizedCard>
  );
}