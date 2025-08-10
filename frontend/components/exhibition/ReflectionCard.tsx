'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Palette, Type, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { FilledTemplate } from '@/lib/exhibitions/reflection-templates';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface ReflectionCardProps {
  reflection: FilledTemplate;
  designTemplate?: DesignTemplate;
}

export interface DesignTemplate {
  id: string;
  name: string;
  style: {
    background: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    layout: 'minimal' | 'artistic' | 'classic' | 'modern';
  };
}

export default function ReflectionCard({ reflection, designTemplate }: ReflectionCardProps) {
  const { language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate>(
    designTemplate || getDefaultTemplate()
  );
  
  const templates: DesignTemplate[] = [
    {
      id: 'minimal',
      name: 'Minimal',
      style: {
        background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
        textColor: '#333333',
        accentColor: '#666666',
        fontFamily: 'Inter, sans-serif',
        layout: 'minimal'
      }
    },
    {
      id: 'artistic',
      name: 'Artistic',
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textColor: '#ffffff',
        accentColor: '#fbbf24',
        fontFamily: 'Playfair Display, serif',
        layout: 'artistic'
      }
    },
    {
      id: 'classic',
      name: 'Classic',
      style: {
        background: '#fafaf9',
        textColor: '#1a1a1a',
        accentColor: '#8b5cf6',
        fontFamily: 'Georgia, serif',
        layout: 'classic'
      }
    },
    {
      id: 'modern',
      name: 'Modern',
      style: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
        textColor: '#ffffff',
        accentColor: '#22d3ee',
        fontFamily: 'DM Sans, sans-serif',
        layout: 'modern'
      }
    }
  ];
  
  function getDefaultTemplate(): DesignTemplate {
    return templates[0];
  }
  
  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `${reflection.exhibition.title.replace(/\s+/g, '_')}_reflection.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success(language === 'ko' ? '이미지 다운로드됨' : 'Image downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(language === 'ko' ? '다운로드 실패' : 'Download failed');
    }
  };
  
  const shareReflection = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reflection.exhibition.title,
          text: getShareText(),
          url: window.location.href
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(getShareText());
      toast.success(language === 'ko' ? '클립보드에 복사됨' : 'Copied to clipboard');
    }
  };
  
  const getShareText = (): string => {
    const responses = Object.values(reflection.responses).filter(r => r);
    return `${reflection.exhibition.title} @ ${reflection.exhibition.gallery.name}\n\n${responses.join('\n\n')}\n\n#SAYUMY #ArtReflection`;
  };
  
  const renderMinimalLayout = () => (
    <div className="p-8 space-y-6">
      <header className="text-center space-y-2">
        <h2 className="text-2xl font-light">{reflection.exhibition.title}</h2>
        <p className="text-sm opacity-70">{reflection.exhibition.gallery.name}</p>
        <p className="text-xs opacity-50">
          {new Date(reflection.metadata.createdAt).toLocaleDateString()}
        </p>
      </header>
      
      <div className="space-y-4">
        {reflection.template.prompts.map((prompt) => {
          const response = reflection.responses[prompt.id];
          if (!response) return null;
          
          return (
            <div key={prompt.id} className="space-y-1">
              <p className="text-sm opacity-60">
                {language === 'ko' ? prompt.prefixKo : prompt.prefix}
              </p>
              <p className="text-base leading-relaxed">{response}</p>
            </div>
          );
        })}
      </div>
      
      <footer className="text-center pt-4 border-t border-current/10">
        <p className="text-xs opacity-50">Created with SAYU.MY</p>
      </footer>
    </div>
  );
  
  const renderArtisticLayout = () => (
    <div className="p-8 space-y-8">
      <header className="space-y-4">
        <div className="w-16 h-1 bg-current opacity-50" />
        <h2 className="text-3xl font-serif">{reflection.exhibition.title}</h2>
        <p className="text-lg opacity-80 font-light italic">
          {reflection.exhibition.gallery.name}
        </p>
      </header>
      
      <div className="space-y-6">
        {reflection.template.prompts.map((prompt, index) => {
          const response = reflection.responses[prompt.id];
          if (!response) return null;
          
          return (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <p className="text-lg leading-relaxed">
                <span className="opacity-70 italic">
                  {language === 'ko' ? prompt.prefixKo : prompt.prefix}
                </span>{' '}
                {response}
              </p>
            </motion.div>
          );
        })}
      </div>
      
      <footer className="flex justify-between items-center pt-6 border-t-2 border-current/20">
        <p className="text-sm opacity-60">
          {new Date(reflection.metadata.createdAt).toLocaleDateString()}
        </p>
        <p className="text-sm font-serif">SAYU.MY</p>
      </footer>
    </div>
  );
  
  const renderClassicLayout = () => (
    <div className="p-10 space-y-6">
      <header className="text-center space-y-3 pb-6 border-b-2 border-current/20">
        <h2 className="text-2xl font-serif tracking-wide">
          {reflection.exhibition.title}
        </h2>
        <p className="text-base opacity-80">{reflection.exhibition.gallery.name}</p>
      </header>
      
      <article className="space-y-5 text-justify">
        {reflection.template.prompts.map((prompt) => {
          const response = reflection.responses[prompt.id];
          if (!response) return null;
          
          return (
            <p key={prompt.id} className="text-base leading-relaxed first-letter:text-2xl first-letter:font-serif">
              {language === 'ko' ? prompt.prefixKo : prompt.prefix} {response}
            </p>
          );
        })}
      </article>
      
      <footer className="text-center pt-6 space-y-2">
        <div className="w-24 h-0.5 bg-current/30 mx-auto" />
        <p className="text-sm opacity-60">
          {new Date(reflection.metadata.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </footer>
    </div>
  );
  
  const renderModernLayout = () => (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest opacity-50">Exhibition</h3>
            <p className="text-sm font-medium">{reflection.exhibition.title}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest opacity-50">Venue</h3>
            <p className="text-sm">{reflection.exhibition.gallery.name}</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest opacity-50">Date</h3>
            <p className="text-sm">
              {new Date(reflection.metadata.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="col-span-2 space-y-4">
          {reflection.template.prompts.map((prompt, index) => {
            const response = reflection.responses[prompt.id];
            if (!response) return null;
            
            return (
              <div key={prompt.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono opacity-50">{`0${index + 1}`}</span>
                  <div className="flex-1 h-px bg-current/10" />
                </div>
                <p className="text-sm leading-relaxed pl-6">
                  <span className="opacity-60">
                    {language === 'ko' ? prompt.prefixKo : prompt.prefix}
                  </span>{' '}
                  {response}
                </p>
              </div>
            );
          })}
          
          <div className="pt-4 mt-6 border-t border-current/10">
            <p className="text-xs font-mono opacity-30">SAYU.MY</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderLayout = () => {
    switch (selectedTemplate.style.layout) {
      case 'minimal':
        return renderMinimalLayout();
      case 'artistic':
        return renderArtisticLayout();
      case 'classic':
        return renderClassicLayout();
      case 'modern':
        return renderModernLayout();
      default:
        return renderMinimalLayout();
    }
  };
  
  return (
    <div className="reflection-card-container space-y-4">
      {/* Template selector */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium whitespace-nowrap">
          {language === 'ko' ? '디자인 선택:' : 'Choose design:'}
        </span>
        {templates.map((template) => (
          <Button
            key={template.id}
            variant={selectedTemplate.id === template.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTemplate(template)}
            className="whitespace-nowrap"
          >
            {template.name}
          </Button>
        ))}
      </div>
      
      {/* Reflection card */}
      <div className="relative">
        <Card
          ref={cardRef}
          className="reflection-card overflow-hidden max-w-2xl mx-auto"
          style={{
            background: selectedTemplate.style.background,
            color: selectedTemplate.style.textColor,
            fontFamily: selectedTemplate.style.fontFamily
          }}
        >
          {renderLayout()}
        </Card>
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={downloadAsImage}
            className="shadow-lg"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={shareReflection}
            className="shadow-lg"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}