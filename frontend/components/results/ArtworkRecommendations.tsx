'use client';

import { motion } from 'framer-motion';
import { Palette, ExternalLink, Bookmark, Heart } from 'lucide-react';
import { useQuizArtworks } from '@/hooks/useArtvee';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmotionalButton } from '@/components/emotional/EmotionalCard';
import ArtworkActions from '@/components/ui/ArtworkActions';
import ArtworkAttribution from '@/components/ui/ArtworkAttribution';

interface ArtworkRecommendationsProps {
  personalityType: string;
}

export default function ArtworkRecommendations({ personalityType }: ArtworkRecommendationsProps) {
  const { language } = useLanguage();
  
  // Use real API data
  const { data: artworks = [], isLoading, error } = useQuizArtworks(personalityType);

  if (error) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? '추천 작품을 불러오는 중 오류가 발생했습니다' : 'Error loading artwork recommendations'}
          </h2>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신을 위한 작품 추천' : 'Artwork Recommendations for You'}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!artworks.length) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? '추천 작품을 준비 중입니다' : 'Artwork recommendations coming soon'}
          </h2>
          <p className="text-[hsl(var(--journey-twilight))] max-w-2xl mx-auto">
            {language === 'ko' 
              ? '곧 당신의 성격에 맞는 특별한 작품들을 추천해드릴 예정입니다.' 
              : 'We are preparing special artwork recommendations tailored to your personality.'
            }
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
      <div className="max-w-6xl mx-auto">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Palette className="w-8 h-8 text-[hsl(var(--journey-rose))] mr-3" />
            <h2 className="text-3xl font-serif text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신을 위한 작품 추천' : 'Artwork Recommendations for You'}
            </h2>
          </div>
          <p className="text-lg text-[hsl(var(--journey-twilight))] max-w-2xl mx-auto">
            {language === 'ko' 
              ? '당신의 성격 유형에 맞는 특별히 선별된 명작들을 만나보세요' 
              : 'Discover masterpieces specially curated for your personality type'
            }
          </p>
        </motion.div>

        {/* 작품 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.artveeId}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                {/* 이미지 플레이스홀더 */}
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center p-4">
                    <Palette className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">{artwork.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{artwork.artist}</p>
                  </div>
                </div>
                
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ArtworkActions artwork={artwork} className="[&>*]:!bg-white/20 [&>*]:!text-white [&>*]:backdrop-blur-sm [&>*]:rounded-full [&>*]:hover:!bg-white/30" />
                </div>
              </div>
              
              {/* 작품 정보 */}
              <div className="mt-3 px-1">
                <h3 className="font-semibold text-[hsl(var(--journey-midnight))] text-sm line-clamp-2">
                  {artwork.title}
                </h3>
                <p className="text-[hsl(var(--journey-twilight))] text-xs mt-1">
                  {artwork.artist}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA 버튼들 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            <EmotionalButton
              variant="primary"
              personality={personalityType}
              onClick={() => window.open('/gallery', '_blank')}
            >
              <Palette className="w-5 h-5" />
              {language === 'ko' ? '더 많은 작품 보기' : 'Explore More Artworks'}
            </EmotionalButton>
            <EmotionalButton
              variant="secondary"
              personality={personalityType}
              onClick={() => window.open('/archive', '_blank')}
            >
              <Bookmark className="w-5 h-5" />
              {language === 'ko' ? '내 컬렉션' : 'My Collection'}
            </EmotionalButton>
          </div>
          
          {/* 저작권 표시 */}
          <ArtworkAttribution className="max-w-md mx-auto" />
        </motion.div>
      </div>
    </section>
  );
}