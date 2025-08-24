'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArtStyle } from '@/types/art-profile';
import { useLanguage } from '@/contexts/LanguageContext';
import { styleFilters } from '@/data/style-filters';

// Static imports for sample images
import basePortrait from '/public/samples/base-portrait.png';
import previewMonet from '/public/samples/preview-monet.png';
import previewPicasso from '/public/samples/preview-picasso.png';
import previewVangogh from '/public/samples/preview-vangogh.png';
import previewWarhol from '/public/samples/preview-warhol.png';
import previewPixel from '/public/samples/preview-pixel.png';
import previewMinhwa from '/public/samples/preview-minhwa.png';
import previewKlimt from '/public/samples/preview-klimt.png';
import previewMondrian from '/public/samples/preview-mondrian.jpg';

interface StylePreviewGridProps {
  selectedStyle: ArtStyle | null;
  onStyleSelect: (style: ArtStyle) => void;
  styles: ArtStyle[];
}

// Map style IDs to imported images
const STYLE_PREVIEWS: Record<string, any> = {
  'monet-impressionism': previewMonet,
  'picasso-cubism': previewPicasso,
  'vangogh-postimpressionism': previewVangogh,
  'warhol-popart': previewWarhol,
  'pixel-art': previewPixel,
  'korean-minhwa': previewMinhwa,
  'klimt-artnouveau': previewKlimt,
  'mondrian-neoplasticism': previewMondrian
};

// Fallback placeholder images
const PLACEHOLDER_BASE = 'https://images.unsplash.com/photo-1494790108755-2616c96b99c0?w=128&h=128&fit=crop&crop=face';
const PLACEHOLDER_PREVIEWS: Record<string, string> = {
  'monet-impressionism': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/128px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg',
  'picasso-cubism': 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg/128px-Pablo_Picasso%2C_1910%2C_Girl_with_a_Mandolin_%28Fanny_Tellier%29%2C_oil_on_canvas%2C_100.3_x_73.6_cm%2C_Museum_of_Modern_Art_New_York..jpg',
  'vangogh-postimpressionism': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/128px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  'warhol-popart': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Marilyndiptych.jpg/128px-Marilyndiptych.jpg',
  'pixel-art': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Pixel_art_alien_abduction.png/128px-Pixel_art_alien_abduction.png',
  'korean-minhwa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Kkachi_horangi.jpg/128px-Kkachi_horangi.jpg',
  'klimt-artnouveau': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/128px-Gustav_Klimt_016.jpg',
  'mondrian-neoplasticism': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Tableau_I%2C_by_Piet_Mondriaan.jpg/128px-Tableau_I%2C_by_Piet_Mondriaan.jpg'
};

export default function StylePreviewGridFixed({ selectedStyle, onStyleSelect, styles }: StylePreviewGridProps) {
  const { language } = useLanguage();
  const [hoveredStyle, setHoveredStyle] = React.useState<string | null>(null);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const getStyleFilter = (styleId: string): string => {
    return styleFilters[styleId as keyof typeof styleFilters]?.filter || 'none';
  };

  const handleImageError = (styleId: string) => {
    console.error('StylePreviewGridFixed - Image failed to load for:', styleId);
    setImageErrors(prev => ({ ...prev, [styleId]: true }));
  };

  return (
    <div className="space-y-4">
      {/* Style Previews Grid */}
      <div>
        <p className="text-sm text-gray-400 font-medium mb-4">
          {language === 'ko' ? '스타일 변환 예시' : 'Style Transformation Examples'}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styles.map((style) => {
            const previewImage = STYLE_PREVIEWS[style.id];
            const hasError = imageErrors[style.id];
            
            return (
              <motion.div
                key={style.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStyleSelect(style)}
                onMouseEnter={() => setHoveredStyle(style.id)}
                onMouseLeave={() => setHoveredStyle(null)}
                className={`
                  cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                  ${selectedStyle?.id === style.id 
                    ? 'border-purple-500 shadow-lg' 
                    : 'border-transparent hover:border-gray-300'
                  }
                `}
              >
                <div className="relative aspect-square bg-gray-100">
                  {!hasError && previewImage ? (
                    <img 
                      src={previewImage.src || previewImage}
                      alt={`${style.name} preview`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(style.id)}
                    />
                  ) : (
                    <img 
                      src={PLACEHOLDER_PREVIEWS[style.id] || PLACEHOLDER_BASE}
                      alt={`${style.name} preview`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {selectedStyle?.id === style.id && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-2">
                        <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs font-medium text-center text-gray-800">
                    {language === 'ko' ? style.nameKo : style.name}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Style Description */}
      {selectedStyle && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 rounded-lg p-4 text-sm"
        >
          <h4 className="font-medium mb-1 text-gray-900">
            {language === 'ko' ? selectedStyle.nameKo : selectedStyle.name}
          </h4>
          <p className="text-gray-700">
            {language === 'ko' ? selectedStyle.descriptionKo : selectedStyle.description}
          </p>
        </motion.div>
      )}
    </div>
  );
}