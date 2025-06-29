'use client';

import { motion } from 'framer-motion';
import { usePersonalizedTheme } from '@/hooks/usePersonalizedTheme';
import { Button } from '@/components/ui/button';
import { Palette, Sparkles, Eye, RefreshCw } from 'lucide-react';

export function ThemeShowcase() {
  const { theme, isLoading, resetToDefault } = usePersonalizedTheme();

  if (isLoading) {
    return (
      <div className="personalized-card">
        <div className="flex items-center space-x-3">
          <div className="animate-spin">
            <Palette className="w-5 h-5" />
          </div>
          <span>Personalizing your experience...</span>
        </div>
      </div>
    );
  }

  if (!theme) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="personalized-card theme-animated-element"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full"
            style={{ background: theme.colors.gradient }}
          />
          <div>
            <h3 className="font-semibold text-lg">{theme.name}</h3>
            <p className="text-sm opacity-75">{theme.description}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefault}
          className="opacity-50 hover:opacity-100"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Personality Traits */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Your Aesthetic Personality</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {theme.personality.traits.map((trait, index) => (
            <motion.span
              key={trait}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: theme.colors.muted,
                color: theme.colors.text,
                border: `1px solid ${theme.colors.border}`
              }}
            >
              {trait}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Color Palette Preview */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Your Color Palette</span>
        </div>
        <div className="flex space-x-2">
          <ColorSwatch color={theme.colors.primary} label="Primary" />
          <ColorSwatch color={theme.colors.secondary} label="Secondary" />
          <ColorSwatch color={theme.colors.accent} label="Accent" />
          <div 
            className="w-8 h-8 rounded-md border"
            style={{ 
              background: theme.colors.gradient,
              borderColor: theme.colors.border
            }}
            title="Gradient"
          />
        </div>
      </div>

      {/* Typography Preview */}
      <div className="space-y-2">
        <p 
          className="text-sm opacity-75"
          style={{ fontFamily: theme.typography.headingFont }}
        >
          Heading: {theme.typography.headingFont.split(',')[0].replace(/"/g, '')}
        </p>
        <p 
          className="text-sm opacity-75"
          style={{ fontFamily: theme.typography.bodyFont }}
        >
          Body: {theme.typography.bodyFont.split(',')[0].replace(/"/g, '')}
        </p>
      </div>
    </motion.div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div 
      className="w-8 h-8 rounded-md border"
      style={{ 
        backgroundColor: color,
        borderColor: 'var(--color-border)'
      }}
      title={label}
    />
  );
}

// Mini version for header/navigation
export function ThemeIndicator() {
  const { theme, isLoading } = usePersonalizedTheme();

  if (isLoading || !theme) {
    return (
      <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse" />
    );
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
      style={{ background: theme.colors.gradient }}
      title={`${theme.name} - ${theme.personality.aesthetic} aesthetic`}
    />
  );
}