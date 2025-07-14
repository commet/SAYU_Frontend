'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmotionalCard, ArtworkCard, EmotionalButton } from '@/components/emotional/EmotionalCard';
import { Heart, Sparkles, Map, Share2, BookOpen, Palette, User } from 'lucide-react';
import '@/styles/emotional-palette.css';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGamificationDashboard } from '@/hooks/useGamification';
import LanguageToggle from '@/components/ui/LanguageToggle';
import ShareModal from '@/components/share/ShareModal';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import ArtworkRecommendations from '@/components/results/ArtworkRecommendations';
import { ArtveeGallery } from '@/components/artvee/ArtveeGallery';

interface QuizResults {
  personalityType: string;
  scores: Record<string, number>;
  responses: any[];
  completedAt: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { dashboard: gamificationData, isLoading: gamificationLoading } = useGamificationDashboard();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [animalCharacter, setAnimalCharacter] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      
      const type = searchParams.get('type') || parsed.personalityType;
      const personalityData = personalityDescriptions[type];
      const animalData = getAnimalByType(type);
      
      setPersonality(personalityData);
      setAnimalCharacter(animalData);
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router]);

  if (!results || !personality) {
    return (
      <div className="min-h-screen gradient-revelation flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white/50" />
        </motion.div>
      </div>
    );
  }

  const shareResult = () => {
    setShowShareModal(true);
  };

  const showProfile = () => {
    setShowProfileCard(true);
  };

  return (
    <div className="min-h-screen bg-off-white" data-personality={results.personalityType}>
      {/* Navigation Header */}
      <header className="bg-white border-b border-light-gray sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-lg py-md flex justify-between items-center">
          <h1 className="font-display text-xl font-medium text-black">
            {language === 'ko' ? '성격 결과' : 'Your Results'}
          </h1>
          <LanguageToggle />
        </div>
      </header>
      
      {/* Hero Section - Clean and Focused */}
      <section className="max-w-4xl mx-auto px-lg py-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {/* Main Result */}
          <div className="bg-white rounded-xl p-3xl border border-gray shadow-gentle mb-2xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <p className="font-body text-dark-gray text-lg mb-sm">
                {language === 'ko' ? '당신은' : 'You are'}
              </p>
              
              <h1 className="font-display text-3xl md:text-4xl font-medium text-black mb-md leading-tight">
                {language === 'ko' && personality.title_ko ? personality.title_ko : personality.title}
              </h1>
              
              <p className="font-body text-xl text-dark-gray mb-xl leading-normal">
                {language === 'ko' && personality.subtitle_ko ? personality.subtitle_ko : personality.subtitle}
              </p>

              {/* Animal Character - Simplified */}
              {animalCharacter && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-xl"
                >
                  <PersonalityAnimalImage 
                    animal={animalCharacter}
                    variant="illustration"
                    size="lg"
                    className="mx-auto mb-md"
                  />
                  <h3 className="font-display text-xl text-black mb-sm">
                    {language === 'ko' ? animalCharacter.animal_ko : animalCharacter.animal}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-xs">
                    {(language === 'ko' ? animalCharacter.characteristics_ko : animalCharacter.characteristics)
                      .slice(0, 3) // 처음 3개만 표시
                      .map((trait: string, index: number) => (
                      <span key={index} className="font-body text-xs px-md py-xs bg-off-white text-dark-gray rounded-full border border-light-gray">
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Type Code - Minimal */}
              <div className="inline-flex items-center gap-sm px-lg py-md bg-off-white rounded-lg border border-light-gray">
                <span className="font-body text-sm text-dark-gray">
                  {language === 'ko' ? '유형 코드' : 'Type'}:
                </span>
                <span className="font-mono font-semibold text-lg text-black">
                  {results.personalityType}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-md mb-3xl"
          >
            <button
              onClick={shareResult}
              className="flex items-center gap-xs px-lg py-md bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-base font-medium"
            >
              <Share2 size={16} />
              {language === 'ko' ? '결과 공유하기' : 'Share Results'}
            </button>
            <button
              onClick={showProfile}
              className="flex items-center gap-xs px-lg py-md bg-off-white text-black border border-gray rounded-md hover:bg-light-gray transition-colors duration-base font-medium"
            >
              <User size={16} />
              {language === 'ko' ? 'ID 카드 보기' : 'View ID Card'}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Content Sections */}
      <div className="max-w-4xl mx-auto px-lg pb-3xl space-y-3xl">
        
        {/* Art Style Breakdown */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle"
        >
          <h2 className="font-display text-2xl font-medium text-black mb-xl text-center">
            {language === 'ko' ? '당신의 예술 감상 스타일' : 'Your Art Appreciation Style'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-md mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[0]}</span>
              </div>
              <p className="font-body text-sm text-dark-gray">
                {results.personalityType[0] === 'L' 
                  ? (language === 'ko' ? '개인적 감상' : 'Personal') 
                  : (language === 'ko' ? '사회적 감상' : 'Social')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-md mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[1]}</span>
              </div>
              <p className="font-body text-sm text-dark-gray">
                {results.personalityType[1] === 'A' 
                  ? (language === 'ko' ? '추상적' : 'Abstract') 
                  : (language === 'ko' ? '구체적' : 'Realistic')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-md mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[2]}</span>
              </div>
              <p className="font-body text-sm text-dark-gray">
                {results.personalityType[2] === 'E' 
                  ? (language === 'ko' ? '감정 중심' : 'Emotional') 
                  : (language === 'ko' ? '의미 추구' : 'Meaningful')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-off-white rounded-lg flex items-center justify-center mb-md mx-auto">
                <span className="font-mono text-2xl font-bold text-primary">{results.personalityType[3]}</span>
              </div>
              <p className="font-body text-sm text-dark-gray">
                {results.personalityType[3] === 'F' 
                  ? (language === 'ko' ? '자유로운' : 'Flexible') 
                  : (language === 'ko' ? '체계적' : 'Structured')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Core Essence */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle text-center"
        >
          <Heart className="w-12 h-12 mx-auto mb-lg text-primary" />
          <h2 className="font-display text-2xl font-medium text-black mb-lg">
            {language === 'ko' ? '당신의 본질' : 'Your Essence'}
          </h2>
          <p className="font-body text-lg text-dark-gray leading-relaxed max-w-2xl mx-auto">
            {language === 'ko' && personality.essence_ko ? personality.essence_ko : personality.essence}
          </p>
        </motion.section>
        
        {/* Your Strengths */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle"
        >
          <h2 className="font-display text-2xl font-medium text-black mb-xl text-center">
            {language === 'ko' ? '당신의 강점' : 'Your Strengths'}
          </h2>
          <div className="grid md:grid-cols-3 gap-lg">
            {personality.strengths.map((strength: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="text-center p-lg"
              >
                <div className="text-4xl mb-md">{strength.icon}</div>
                <h3 className="font-display text-lg font-medium text-black mb-sm">
                  {language === 'ko' && strength.title_ko ? strength.title_ko : strength.title}
                </h3>
                <p className="font-body text-sm text-dark-gray leading-normal">
                  {language === 'ko' && strength.description_ko ? strength.description_ko : strength.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recognition */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-xl border border-gray shadow-gentle"
        >
          <h2 className="font-display text-2xl font-medium text-black mb-xl text-center">
            {language === 'ko' ? '이런 모습에서 자신을 발견할 수 있어요' : 'You might recognize yourself in...'}
          </h2>
          <div className="flex flex-wrap justify-center gap-xs">
            {personality.recognition.map((item: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                className="px-md py-xs bg-off-white text-dark-gray rounded-full border border-light-gray font-body text-sm"
              >
                {language === 'ko' && personality.recognition_ko ? personality.recognition_ko[index] : item}
              </motion.span>
              ))}
          </div>
        </motion.section>
      </div>

      {/* How This Extends to Life */}
      <section className="bg-[hsl(var(--gallery-white))] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--personality-accent))]" />
            <h2 className="text-4xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '예술은 일상으로 흐릅니다' : 'This extends beyond galleries'}
            </h2>
            <p className="text-xl text-[hsl(var(--journey-twilight))] max-w-3xl mx-auto">
              {language === 'ko' && personality.lifeExtension_ko ? personality.lifeExtension_ko : personality.lifeExtension}
            </p>
          </motion.div>

          {/* Life Areas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personality.lifeAreas.map((area: any, index: number) => (
              <EmotionalCard
                key={index}
                delay={index * 0.1}
                personality={results.personalityType}
                className="p-8"
              >
                <h3 className="text-xl font-medium mb-3">
                  {language === 'ko' && area.title_ko ? area.title_ko : area.title}
                </h3>
                <p className="opacity-80">
                  {language === 'ko' && area.description_ko ? area.description_ko : area.description}
                </p>
              </EmotionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Palette className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--personality-accent))]" />
            <h2 className="text-4xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신의 언어로 말하는 예술가들' : 'Artists who speak your language'}
            </h2>
            <p className="text-xl text-[hsl(var(--journey-twilight))]">
              {language === 'ko' ? '당신만의 독특한 예술 경험 방식에 기반하여' : 'Based on your unique way of experiencing art'}
            </p>
          </motion.div>

          {/* Artist Recommendations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {personality.recommendedArtists.map((artist: any, index: number) => (
              <ArtworkCard
                key={index}
                image={artist.image}
                title={artist.name}
                artist={artist.period}
                description={artist.whyYouConnect}
                emotionalTag={artist.emotionalTag}
                personality={results.personalityType}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Artvee Gallery Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-serif mb-8 text-center text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신의 성격과 어울리는 작품들' : 'Artworks that match your personality'}
            </h3>
            <ArtveeGallery personalityType={results.personalityType} />
          </motion.div>

          {/* Current Exhibitions */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-serif mb-8 text-[hsl(var(--journey-midnight))]">
              {language === 'ko' ? '당신을 기다리는 전시회' : 'Exhibitions waiting for you'}
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EmotionalButton
                variant="primary"
                size="lg"
                personality={results.personalityType}
                onClick={() => router.push('/exhibitions')}
              >
                <Map className="w-5 h-5" />
                {language === 'ko' ? '나의 예술 지도 탐험하기' : 'Explore Your Art Map'}
              </EmotionalButton>
              <EmotionalButton
                variant="secondary"
                size="lg"
                personality={results.personalityType}
                onClick={() => router.push(`/compatibility?type1=${results.personalityType}`)}
              >
                <Heart className="w-5 h-5" />
                {language === 'ko' ? '궁합 확인하기' : 'Check Chemistry'}
              </EmotionalButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artwork Recommendations */}
      <ArtworkRecommendations personalityType={results.personalityType} />

      {/* Share Your Journey */}
      <section className="py-20 px-4 text-center bg-[hsl(var(--gallery-pearl))]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
            {language === 'ko' ? '당신의 예술적 영혼을 공유하세요' : 'Share your artistic soul'}
          </h2>
          <p className="text-lg mb-8 text-[hsl(var(--journey-twilight))] max-w-2xl mx-auto">
            {language === 'ko' 
              ? '다른 사람들이 자신만의 여정을 발견하도록 돕거나, 당신처럼 세상을 보는 비슷한 영혼을 찾아보세요' 
              : 'Let others discover their own journey, or find kindred spirits who see the world as you do'
            }
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <EmotionalButton
              variant="primary"
              onClick={shareResult}
              personality={results.personalityType}
            >
              <Share2 className="w-5 h-5" />
              {language === 'ko' ? '내 유형 공유하기' : 'Share Your Type'}
            </EmotionalButton>
            <EmotionalButton
              variant="secondary"
              onClick={showProfile}
              personality={results.personalityType}
            >
              <User className="w-5 h-5" />
              {language === 'ko' ? '프로필 카드' : 'Profile Card'}
            </EmotionalButton>
            <EmotionalButton
              variant="ghost"
              onClick={() => router.push('/community')}
              personality={results.personalityType}
            >
              <BookOpen className="w-5 h-5" />
              {language === 'ko' ? '나의 부족 찾기' : 'Find Your Tribe'}
            </EmotionalButton>
          </div>
        </motion.div>
      </section>

      {/* Share Modal */}
      <ShareModal
        personalityType={results.personalityType}
        userName="SAYU Explorer"
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Profile ID Card */}
      {showProfileCard && (
        <ProfileIDCard
          personalityType={results.personalityType}
          userName="SAYU Explorer"
          userLevel={gamificationData?.level || 1}
          userPoints={gamificationData?.totalPoints || 0}
          stats={{
            exhibitionsVisited: gamificationData?.exhibitionHistory?.length || 0,
            achievementsUnlocked: gamificationData?.achievements?.filter(a => a.earnedAt).length || 0,
            companionsMetCount: 0 // This would come from evaluation system
          }}
          recentExhibitions={
            gamificationData?.recentExhibitions?.slice(0, 3).map(visit => ({
              name: visit.exhibitionName,
              date: new Date(visit.visitDate).toLocaleDateString()
            })) || []
          }
          plannedExhibitions={[
            { name: '모네의 정원', venue: '국립현대미술관' },
            { name: 'Van Gogh Alive', venue: 'DDP' }
          ]}
          topAchievements={
            gamificationData?.achievements?.filter(a => a.earnedAt).slice(0, 3).map(achievement => ({
              name: language === 'ko' ? achievement.nameKo : achievement.name,
              icon: achievement.icon
            })) || []
          }
          onClose={() => setShowProfileCard(false)}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-revelation flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white/50" />
        </motion.div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}