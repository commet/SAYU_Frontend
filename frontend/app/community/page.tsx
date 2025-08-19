'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ForumList } from '@/components/community/ForumList';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Sparkles, Heart, Palette, Eye, Calendar, MapPin, ChevronRight, Info, MoreVertical, Flag, Ban, Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { getAnimalByType } from '@/data/personality-animals';
import { PersonalityAnimalImage } from '@/components/ui/PersonalityAnimalImage';
import { chemistryData, ChemistryData } from '@/data/personality-chemistry';
import { getArtworkRecommendations } from '@/lib/artworkRecommendations';
import { getExhibitionRecommendation } from '@/lib/exhibitionRecommendations';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { synergyTable, getSynergyKey } from '@/data/personality-synergy-table';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import dynamic from 'next/dynamic';

// Lazy load mobile component
const MobileCommunity = dynamic(() => import('@/components/mobile/MobileCommunity'), {
  ssr: false
});

interface UserMatch {
  id: string;
  nickname: string;
  personalityType: string;
  compatibility: 'perfect' | 'good' | 'challenging' | 'learning';
  compatibilityScore: number;
  lastActive: string;
  exhibitions: number;
  artworks: number;
  avatar?: string; // TODO: 나중에 사용자 프로필 사진 업로드 기능 추가 시 활용
  gender?: 'male' | 'female' | 'other';
  isLiked?: boolean;
  hasLikedMe?: boolean;
  isMatched?: boolean;
  age?: number;
  distance?: number; // km
}

interface ExhibitionMatch {
  id: string;
  title: string;
  museum: string;
  image: string;
  matchingUsers: number;
  endDate: string;
}

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'matches' | 'exhibitions' | 'forums'>('matches');
  const [selectedMatch, setSelectedMatch] = useState<UserMatch | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'opposite'>('all');
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [showReportModal, setShowReportModal] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [ageFilter, setAgeFilter] = useState<{ min: number; max: number }>({ min: 20, max: 50 });
  const [distanceFilter, setDistanceFilter] = useState<number>(50); // km
  const [showFilters, setShowFilters] = useState(false);
  const [exhibitionMatches, setExhibitionMatches] = useState<ExhibitionMatch[]>([]);
  const [loadingExhibitions, setLoadingExhibitions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch real exhibition data
  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoadingExhibitions(true);
        const response = await fetch('/api/exhibitions?limit=100');
        
        if (response.ok) {
          const data = await response.json();
          const exhibitions = data.data || data.exhibitions || [];
          
          // Find specific exhibitions: 리움 이불전 and 르누아르전
          const targetExhibitions: ExhibitionMatch[] = [];
          
          // Look for 리움 이불 전시
          const leebulExhibition = exhibitions.find((ex: any) => 
            (ex.title?.includes('이불') || ex.title?.includes('LEE BUL')) && 
            (ex.venue_name?.includes('리움') || ex.venue?.includes('리움'))
          );
          
          if (leebulExhibition) {
            targetExhibitions.push({
              id: leebulExhibition.id || '1',
              title: leebulExhibition.title || '이불: 시작',
              museum: leebulExhibition.venue_name || '리움미술관',
              image: leebulExhibition.image_url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc31?w=400',
              matchingUsers: 18,
              endDate: '2025.05.25'
            });
          }
          
          // Look for 르누아르 전시
          const renoirExhibition = exhibitions.find((ex: any) => 
            (ex.title?.includes('르누아르') || ex.title?.includes('Renoir')) && 
            (ex.venue_name?.includes('한가람') || ex.venue?.includes('한가람'))
          );
          
          if (renoirExhibition) {
            targetExhibitions.push({
              id: renoirExhibition.id || '2',
              title: renoirExhibition.title || '르누아르: 여인의 향기',
              museum: renoirExhibition.venue_name || '예술의전당 한가람미술관',
              image: renoirExhibition.image_url || 'https://images.unsplash.com/photo-1577720643272-265f09367456?w=400',
              matchingUsers: 24,
              endDate: '2025.04.20'
            });
          }
          
          // Set the found exhibitions
          setExhibitionMatches(targetExhibitions);
        } else {
          console.error('Failed to fetch exhibitions');
        }
      } catch (error) {
        console.error('Error fetching exhibitions:', error);
      } finally {
        setLoadingExhibitions(false);
      }
    };

    fetchExhibitions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/backgrounds/classical-gallery-floor-sitting-contemplation.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mock data for user personality type (should come from user profile)
  const userPersonalityType = user.personalityType || 'LAEF';
  const userAnimal = getAnimalByType(userPersonalityType);

  // Find compatible users based on chemistry data
  const findCompatibleUsers = (): UserMatch[] => {
    // 16가지 유형별 매칭 데이터
    const mockUsersByType: Record<string, UserMatch[]> = {
      // 여우(LAEF) 사용자를 위한 매칭
      LAEF: [
        {
          id: '1',
          nickname: 'sohee.moment',
          personalityType: 'SAEF',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '2시간 전',
          exhibitions: 42,
          artworks: 156,
          avatar: '🦋',
          gender: 'female',
          hasLikedMe: true,
          age: 28,
          distance: 3.5
        },
        {
          id: '2',
          nickname: 'wooj1n',
          personalityType: 'LREF',
          compatibility: 'perfect',
          compatibilityScore: 88,
          lastActive: '30분 전',
          exhibitions: 38,
          artworks: 142,
          avatar: '🦎',
          gender: 'male',
          hasLikedMe: true,
          age: 32,
          distance: 8.2
        },
        {
          id: '3',
          nickname: 'ur.fav.muse',
          personalityType: 'LAMF',
          compatibility: 'good',
          compatibilityScore: 72,
          lastActive: '1일 전',
          exhibitions: 28,
          artworks: 89,
          avatar: '🦉',
          age: 25,
          distance: 15.7
        },
        {
          id: '4',
          nickname: 'dahyun_00',
          personalityType: 'SRMC',
          compatibility: 'challenging',
          compatibilityScore: 35,
          lastActive: '방금 전',
          exhibitions: 156,
          artworks: 480,
          avatar: 'https://i.pravatar.cc/150?img=12',
          gender: 'female',
          age: 41,
          distance: 22.3
        }
      ],
      // 나비(SAEF) 사용자를 위한 매칭
      SAEF: [
        {
          id: '1',
          nickname: 'yuna___98',
          personalityType: 'LAEF',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '1시간 전',
          exhibitions: 35,
          artworks: 128,
          avatar: '🦊',
          hasLikedMe: true,
          age: 30,
          distance: 5.1
        },
        {
          id: '2',
          nickname: 'oldschool.k',
          personalityType: 'LAMC',
          compatibility: 'good',
          compatibilityScore: 87,
          lastActive: '3시간 전',
          exhibitions: 89,
          artworks: 312,
          avatar: '🐢',
          age: 45,
          distance: 12.8
        },
        {
          id: '3',
          nickname: 'ssul.collector',
          personalityType: 'SAEC',
          compatibility: 'good',
          compatibilityScore: 71,
          lastActive: '2일 전',
          exhibitions: 45,
          artworks: 167,
          avatar: '🐧',
          age: 27,
          distance: 35.4
        },
        {
          id: '4',
          nickname: 'junho.archive',
          personalityType: 'SRMC',
          compatibility: 'challenging',
          compatibilityScore: 38,
          lastActive: '5시간 전',
          exhibitions: 234,
          artworks: 890,
          avatar: 'https://i.pravatar.cc/150?img=8',
          gender: 'male',
          age: 38,
          distance: 2.1
        }
      ],
      // 올빼미(LAMF) 사용자를 위한 매칭
      LAMF: [
        {
          id: '1',
          nickname: 'void.min',
          personalityType: 'LAMC',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '4시간 전',
          exhibitions: 67,
          artworks: 234,
          avatar: '🐢'
        },
        {
          id: '2',
          nickname: 'eunwoo_',
          personalityType: 'SAMF',
          compatibility: 'good',
          compatibilityScore: 86,
          lastActive: '30분 전',
          exhibitions: 23,
          artworks: 78,
          avatar: '🦜'
        },
        {
          id: '3',
          nickname: 'chaewon.art',
          personalityType: 'LAEF',
          compatibility: 'good',
          compatibilityScore: 70,
          lastActive: '1일 전',
          exhibitions: 34,
          artworks: 123,
          avatar: '🦊'
        },
        {
          id: '4',
          nickname: 'hyein____',
          personalityType: 'SREF',
          compatibility: 'challenging',
          compatibilityScore: 32,
          lastActive: '방금 전',
          exhibitions: 12,
          artworks: 34,
          avatar: '🐕'
        }
      ],
      // 거북이(LAMC) 사용자를 위한 매칭
      LAMC: [
        {
          id: '1',
          nickname: 'doc.kim',
          personalityType: 'SRMF',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '2시간 전',
          exhibitions: 78,
          artworks: 289,
          avatar: '🐘'
        },
        {
          id: '2',
          nickname: 'after2am',
          personalityType: 'LAMF',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '1시간 전',
          exhibitions: 56,
          artworks: 198,
          avatar: '🦉'
        },
        {
          id: '3',
          nickname: 'lowkey.jin',
          personalityType: 'LRMC',
          compatibility: 'good',
          compatibilityScore: 85,
          lastActive: '3일 전',
          exhibitions: 123,
          artworks: 456,
          avatar: '🦫'
        },
        {
          id: '4',
          nickname: 'artlover_93',
          personalityType: 'SREF',
          compatibility: 'challenging',
          compatibilityScore: 35,
          lastActive: '10분 전',
          exhibitions: 8,
          artworks: 23,
          avatar: 'https://i.pravatar.cc/150?img=5',
          gender: 'male'
        }
      ],
      // 고양이(LAEC) 사용자를 위한 매칭  
      LAEC: [
        {
          id: '1',
          nickname: 'yuna___98',
          personalityType: 'LAEF',
          compatibility: 'perfect',
          compatibilityScore: 92,
          lastActive: '2시간 전',
          exhibitions: 56,
          artworks: 234,
          avatar: '🦊'
        },
        {
          id: '2',
          nickname: '민감한사슴',
          personalityType: 'LREC',
          compatibility: 'good',
          compatibilityScore: 88,
          lastActive: '1시간 전',
          exhibitions: 45,
          artworks: 178,
          avatar: '🦌'
        },
        {
          id: '3',
          nickname: '큐레이션마스터',
          personalityType: 'LRMC',
          compatibility: 'good',
          compatibilityScore: 75,
          lastActive: '3시간 전',
          exhibitions: 89,
          artworks: 356,
          avatar: '🦫'
        },
        {
          id: '4',
          nickname: 'party_lover',
          personalityType: 'SAEF',
          compatibility: 'challenging',
          compatibilityScore: 42,
          lastActive: '30분 전',
          exhibitions: 23,
          artworks: 67,
          avatar: '🦋'
        }
      ],
      // 카멜레온(LREF) 사용자를 위한 매칭
      LREF: [
        {
          id: '1',
          nickname: '꿈꾸는여우',
          personalityType: 'LAEF',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '1시간 전',
          exhibitions: 45,
          artworks: 178,
          avatar: '🦊'
        },
        {
          id: '2',
          nickname: '민지',
          personalityType: 'LREC',
          compatibility: 'good',
          compatibilityScore: 85,
          lastActive: '2시간 전',
          exhibitions: 34,
          artworks: 129,
          avatar: '🦌'
        },
        {
          id: '3',
          nickname: '공감가이드',
          personalityType: 'SREC',
          compatibility: 'good',
          compatibilityScore: 76,
          lastActive: '6시간 전',
          exhibitions: 67,
          artworks: 245,
          avatar: 'https://i.pravatar.cc/150?img=25',
          gender: 'female'
        },
        {
          id: '4',
          nickname: '논리주의자',
          personalityType: 'SRMC',
          compatibility: 'challenging',
          compatibilityScore: 40,
          lastActive: '30분 전',
          exhibitions: 89,
          artworks: 334,
          avatar: '🦅'
        }
      ],
      // 사슴(LREC) 사용자를 위한 매칭
      LREC: [
        {
          id: '1',
          nickname: '색감탐구자',
          personalityType: 'LREF',
          compatibility: 'good',
          compatibilityScore: 85,
          lastActive: '3시간 전',
          exhibitions: 29,
          artworks: 98,
          avatar: '🦎'
        },
        {
          id: '2',
          nickname: 'alex_moon',
          personalityType: 'SAMF',
          compatibility: 'learning',
          compatibilityScore: 65,
          lastActive: '1일 전',
          exhibitions: 23,
          artworks: 67,
          avatar: '🦜'
        },
        {
          id: '3',
          nickname: '조용한감상가',
          personalityType: 'LAMC',
          compatibility: 'good',
          compatibilityScore: 70,
          lastActive: '5시간 전',
          exhibitions: 78,
          artworks: 289,
          avatar: '🐢'
        },
        {
          id: '4',
          nickname: '서준',
          personalityType: 'SREF',
          compatibility: 'challenging',
          compatibilityScore: 45,
          lastActive: '방금 전',
          exhibitions: 12,
          artworks: 34,
          avatar: 'https://i.pravatar.cc/150?img=3',
          gender: 'male'
        }
      ],
      // 수달(LRMF) 사용자를 위한 매칭
      LRMF: [
        {
          id: '1',
          nickname: '깊이탐구자',
          personalityType: 'LRMC',
          compatibility: 'good',
          compatibilityScore: 88,
          lastActive: '2시간 전',
          exhibitions: 123,
          artworks: 456,
          avatar: '🦫'
        },
        {
          id: '2',
          nickname: '거북현자',
          personalityType: 'LAMC',
          compatibility: 'good',
          compatibilityScore: 82,
          lastActive: '4시간 전',
          exhibitions: 89,
          artworks: 345,
          avatar: '🐢'
        },
        {
          id: '3',
          nickname: '이야기전달자',
          personalityType: 'SRMF',
          compatibility: 'good',
          compatibilityScore: 79,
          lastActive: '1일 전',
          exhibitions: 67,
          artworks: 234,
          avatar: '🐘'
        },
        {
          id: '4',
          nickname: '나비탐험가',
          personalityType: 'SAEF',
          compatibility: 'challenging',
          compatibilityScore: 52,
          lastActive: '10분 전',
          exhibitions: 23,
          artworks: 78,
          avatar: '🦋'
        }
      ],
      // 비버(LRMC) 사용자를 위한 매칭
      LRMC: [
        {
          id: '1',
          nickname: '역사전문가',
          personalityType: 'SRMF',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '1시간 전',
          exhibitions: 98,
          artworks: 367,
          avatar: '🐘'
        },
        {
          id: '2',
          nickname: 'museum_walker',
          personalityType: 'LRMF',
          compatibility: 'good',
          compatibilityScore: 88,
          lastActive: '3시간 전',
          exhibitions: 112,
          artworks: 423,
          avatar: '🦦'
        },
        {
          id: '3',
          nickname: '통찰자',
          personalityType: 'LAMF',
          compatibility: 'good',
          compatibilityScore: 76,
          lastActive: '6시간 전',
          exhibitions: 56,
          artworks: 189,
          avatar: '🦉'
        },
        {
          id: '4',
          nickname: '나비탐험가',
          personalityType: 'SAEF',
          compatibility: 'challenging',
          compatibilityScore: 48,
          lastActive: '2시간 전',
          exhibitions: 34,
          artworks: 123,
          avatar: 'https://i.pravatar.cc/150?img=18',
          gender: 'female'
        }
      ],
      // 펭귄(SAEC) 사용자를 위한 매칭
      SAEC: [
        {
          id: '1',
          nickname: '따뜻한오리',
          personalityType: 'SREC',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '30분 전',
          exhibitions: 89,
          artworks: 334,
          avatar: '🦆'
        },
        {
          id: '2',
          nickname: '수진',
          personalityType: 'SAEF',
          compatibility: 'good',
          compatibilityScore: 80,
          lastActive: '2시간 전',
          exhibitions: 45,
          artworks: 167,
          avatar: '🦋'
        },
        {
          id: '3',
          nickname: 'theory.k',
          personalityType: 'LAEC',
          compatibility: 'good',
          compatibilityScore: 75,
          lastActive: '1일 전',
          exhibitions: 67,
          artworks: 256,
          avatar: '🐱'
        },
        {
          id: '4',
          nickname: 'solitary_cat',
          personalityType: 'LAMC',
          compatibility: 'challenging',
          compatibilityScore: 42,
          lastActive: '5시간 전',
          exhibitions: 134,
          artworks: 512,
          avatar: 'https://i.pravatar.cc/150?img=14',
          gender: 'male'
        }
      ],
      // 앵무새(SAMF) 사용자를 위한 매칭
      SAMF: [
        {
          id: '1',
          nickname: 'ur.fav.muse',
          personalityType: 'LAMF',
          compatibility: 'good',
          compatibilityScore: 75,
          lastActive: '1시간 전',
          exhibitions: 67,
          artworks: 234,
          avatar: '🦉'
        },
        {
          id: '2',
          nickname: '아트커넥터',
          personalityType: 'SAEC',
          compatibility: 'good',
          compatibilityScore: 82,
          lastActive: '3시간 전',
          exhibitions: 45,
          artworks: 156,
          avatar: '🐧'
        },
        {
          id: '3',
          nickname: 'jiho_art',
          personalityType: 'SAEF',
          compatibility: 'good',
          compatibilityScore: 78,
          lastActive: '30분 전',
          exhibitions: 34,
          artworks: 123,
          avatar: '🦋'
        },
        {
          id: '4',
          nickname: '섬세한영혼',
          personalityType: 'LREC',
          compatibility: 'learning',
          compatibilityScore: 65,
          lastActive: '2일 전',
          exhibitions: 23,
          artworks: 89,
          avatar: '🦌'
        }
      ],
      // 벌(SAMC) 사용자를 위한 매칭
      SAMC: [
        {
          id: '1',
          nickname: 'dahyun_00',
          personalityType: 'SRMC',
          compatibility: 'good',
          compatibilityScore: 85,
          lastActive: '2시간 전',
          exhibitions: 178,
          artworks: 667,
          avatar: '🦅'
        },
        {
          id: '2',
          nickname: '조화구축가',
          personalityType: 'SAEC',
          compatibility: 'good',
          compatibilityScore: 80,
          lastActive: '4시간 전',
          exhibitions: 56,
          artworks: 189,
          avatar: '🐧'
        },
        {
          id: '3',
          nickname: '예술스토리텔러',
          personalityType: 'SRMF',
          compatibility: 'good',
          compatibilityScore: 77,
          lastActive: '1일 전',
          exhibitions: 89,
          artworks: 345,
          avatar: 'https://i.pravatar.cc/150?img=22',
          gender: 'female'
        },
        {
          id: '4',
          nickname: '자유영혼',
          personalityType: 'LAEF',
          compatibility: 'challenging',
          compatibilityScore: 45,
          lastActive: '1시간 전',
          exhibitions: 12,
          artworks: 45,
          avatar: '🦊'
        }
      ],
      // 강아지(SREF) 사용자를 위한 매칭
      SREF: [
        {
          id: '1',
          nickname: '전시마스터',
          personalityType: 'SREC',
          compatibility: 'good',
          compatibilityScore: 88,
          lastActive: '30분 전',
          exhibitions: 98,
          artworks: 378,
          avatar: '🦆'
        },
        {
          id: '2',
          nickname: 'sunny_day22',
          personalityType: 'SAEF',
          compatibility: 'good',
          compatibilityScore: 76,
          lastActive: '2시간 전',
          exhibitions: 34,
          artworks: 123,
          avatar: '🦋'
        },
        {
          id: '3',
          nickname: '기억수집가',
          personalityType: 'SRMF',
          compatibility: 'good',
          compatibilityScore: 72,
          lastActive: '5시간 전',
          exhibitions: 67,
          artworks: 234,
          avatar: '/images/profiles/runner-realistic.jpg'
        },
        {
          id: '4',
          nickname: '느림의미학',
          personalityType: 'LAMC',
          compatibility: 'challenging',
          compatibilityScore: 35,
          lastActive: '3시간 전',
          exhibitions: 234,
          artworks: 890,
          avatar: '🐢'
        }
      ],
      // 오리(SREC) 사용자를 위한 매칭
      SREC: [
        {
          id: '1',
          nickname: '조화구축가',
          personalityType: 'SAEC',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '1시간 전',
          exhibitions: 67,
          artworks: 245,
          avatar: '🐧'
        },
        {
          id: '2',
          nickname: '현준이',
          personalityType: 'SREF',
          compatibility: 'good',
          compatibilityScore: 88,
          lastActive: '30분 전',
          exhibitions: 45,
          artworks: 156,
          avatar: '🐕'
        },
        {
          id: '3',
          nickname: '지혜공유자',
          personalityType: 'SRMF',
          compatibility: 'good',
          compatibilityScore: 79,
          lastActive: '4시간 전',
          exhibitions: 89,
          artworks: 334,
          avatar: '🐘'
        },
        {
          id: '4',
          nickname: '심미주의자',
          personalityType: 'LAEC',
          compatibility: 'challenging',
          compatibilityScore: 52,
          lastActive: '2일 전',
          exhibitions: 123,
          artworks: 467,
          avatar: '🐱'
        }
      ],
      // 코끼리(SRMF) 사용자를 위한 매칭
      SRMF: [
        {
          id: '1',
          nickname: '지식탐구비버',
          personalityType: 'LRMC',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '2시간 전',
          exhibitions: 156,
          artworks: 589,
          avatar: '🦫'
        },
        {
          id: '2',
          nickname: '지혜수호자',
          personalityType: 'LAMC',
          compatibility: 'perfect',
          compatibilityScore: 95,
          lastActive: '3시간 전',
          exhibitions: 189,
          artworks: 723,
          avatar: '🐢'
        },
        {
          id: '3',
          nickname: '안내의오리',
          personalityType: 'SREC',
          compatibility: 'good',
          compatibilityScore: 79,
          lastActive: '1일 전',
          exhibitions: 78,
          artworks: 289,
          avatar: '🦆'
        },
        {
          id: '4',
          nickname: 'moment_catcher',
          personalityType: 'SAEF',
          compatibility: 'challenging',
          compatibilityScore: 48,
          lastActive: '10분 전',
          exhibitions: 23,
          artworks: 67,
          avatar: '/images/profiles/moment-realistic.jpg'
        }
      ],
      // 독수리(SRMC) 사용자를 위한 매칭
      SRMC: [
        {
          id: '1',
          nickname: '박교수님',
          personalityType: 'SAMC',
          compatibility: 'good',
          compatibilityScore: 85,
          lastActive: '1시간 전',
          exhibitions: 234,
          artworks: 890,
          avatar: '🐝'
        },
        {
          id: '2',
          nickname: '예술교육자',
          personalityType: 'SRMC',
          compatibility: 'good',
          compatibilityScore: 80,
          lastActive: '4시간 전',
          exhibitions: 267,
          artworks: 1023,
          avatar: '🦅'
        },
        {
          id: '3',
          nickname: '학술연구자',
          personalityType: 'LRMC',
          compatibility: 'good',
          compatibilityScore: 77,
          lastActive: '6시간 전',
          exhibitions: 189,
          artworks: 712,
          avatar: '/images/profiles/researcher-realistic.jpg'
        },
        {
          id: '4',
          nickname: 'dreamy_fox',
          personalityType: 'LAEF',
          compatibility: 'challenging',
          compatibilityScore: 45,
          lastActive: '30분 전',
          exhibitions: 34,
          artworks: 123,
          avatar: '🦊'
        }
      ]
    };

    // 현재 사용자 타입에 맞는 mock data 반환
    const availableUsers = mockUsersByType[userPersonalityType] || mockUsersByType['LAEF'];
    return availableUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  };

  const allCompatibleUsers = findCompatibleUsers();
  
  // 사용자 성별 임시 설정 (실제로는 user 객체에서 가져와야 함)
  const userGender = 'male'; // TODO: user.gender로 변경
  
  // 필터링 적용
  let filteredUsers = allCompatibleUsers;
  
  // 성별 필터
  if (genderFilter === 'opposite') {
    filteredUsers = filteredUsers.filter(match => {
      if (!match.gender || !userGender) return true;
      return match.gender !== userGender;
    });
  }
  
  // 나이 필터
  filteredUsers = filteredUsers.filter(match => {
    if (!match.age) return true;
    return match.age >= ageFilter.min && match.age <= ageFilter.max;
  });
  
  // 거리 필터
  filteredUsers = filteredUsers.filter(match => {
    if (!match.distance) return true;
    return match.distance <= distanceFilter;
  });
  
  const compatibleUsers = filteredUsers;

  // 좋아요 토글 함수
  const handleLikeToggle = (userId: string) => {
    setLikedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
        // TODO: 실제로는 여기서 서버에 좋아요 요청을 보내야 함
        // 상대방도 나를 좋아하면 매칭 성사 알림
      }
      return newSet;
    });
  };

  const handleBlock = (userId: string) => {
    setBlockedUsers((prev) => {
      const newSet = new Set(prev);
      newSet.add(userId);
      return newSet;
    });
    // TODO: 서버에 차단 요청
  };

  const handleReport = (userId: string, reason: string) => {
    // TODO: 서버에 신고 전송
    console.log(`Reported user ${userId} for: ${reason}`);
    setShowReportModal(null);
    // 신고 후 자동으로 차단
    handleBlock(userId);
  };


  // Helper function to format date
  const formatEndDate = (dateStr: string) => {
    if (!dateStr) return '2025.03.31';
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  const getCustomChemistryData = (type1: string, type2: string): ChemistryData | null => {
    // LAEF(여우)의 케미스트리
    if ((type1 === 'LAEF' && type2 === 'LAMF') || (type1 === 'LAMF' && type2 === 'LAEF')) {
      return {
        type1: 'LAEF',
        type2: 'LAMF',
        compatibility: 'good',
        title: 'Intuitive Understanding',
        title_ko: '직관적 이해의 만남',
        synergy: {
          description: "Fox's emotional depth meets Owl's wisdom - creating profound insights",
          description_ko: '여우의 감정적 깊이와 올빼미의 지혜가 만나 깊은 통찰을 만들어냅니다'
        },
        recommendedExhibitions: [
          'Contemplative art installations',
          'Philosophy-themed exhibitions',
          'Symbolic art collections',
          'Night-time gallery events'
        ],
        recommendedExhibitions_ko: [
          '사색적 설치 미술',
          '철학 주제 전시',
          '상징주의 컬렉션',
          '야간 갤러리 이벤트'
        ],
        conversationExamples: [{
          person1: "This piece speaks to something deeper...",
          person1_ko: "이 작품에서 더 깊은 무언가가 느껴져...",
          person2: "Yes, I see the hidden symbolism here",
          person2_ko: "맞아, 여기 숨겨진 상징이 보여"
        }],
        tips: {
          for_type1: "Owl appreciates your emotional insights - share them freely",
          for_type1_ko: "올빼미는 당신의 감정적 통찰을 높이 평가해요 - 자유롭게 나누세요",
          for_type2: "Fox needs time to process emotions - be patient",
          for_type2_ko: "여우는 감정을 처리할 시간이 필요해요 - 인내심을 가지세요"
        }
      };
    }
    
    // SAEF(나비)의 케미스트리
    if ((type1 === 'SAEF' && type2 === 'LAMC') || (type1 === 'LAMC' && type2 === 'SAEF')) {
      return {
        type1: 'SAEF',
        type2: 'LAMC',
        compatibility: 'good',
        title: 'Expression meets Archive',
        title_ko: '표현과 기록의 조화',
        synergy: {
          description: "Butterfly's vibrant expression enriches Turtle's deep collection",
          description_ko: '나비의 생생한 표현이 거북이의 깊은 수집을 풍성하게 만듭니다'
        },
        recommendedExhibitions: [
          'Interactive archive exhibitions',
          'Living history displays',
          'Contemporary reinterpretations',
          'Collection highlights tours'
        ],
        recommendedExhibitions_ko: [
          '인터랙티브 아카이브 전시',
          '살아있는 역사 전시',
          '현대적 재해석전',
          '컬렉션 하이라이트 투어'
        ],
        conversationExamples: [{
          person1: "This makes me feel so alive!",
          person1_ko: "이거 정말 생동감 넘쳐!",
          person2: "It's part of a larger historical narrative...",
          person2_ko: "이건 더 큰 역사적 맥락의 일부야..."
        }],
        tips: {
          for_type1: "Turtle has deep knowledge - ask questions to unlock stories",
          for_type1_ko: "거북이는 깊은 지식이 있어요 - 질문으로 이야기를 끌어내세요",
          for_type2: "Butterfly brings fresh energy - let it inspire new perspectives",
          for_type2_ko: "나비는 신선한 에너지를 가져와요 - 새로운 관점을 얻으세요"
        }
      };
    }
    
    if ((type1 === 'SAEF' && type2 === 'SAEC') || (type1 === 'SAEC' && type2 === 'SAEF')) {
      return {
        type1: 'SAEF',
        type2: 'SAEC',
        compatibility: 'good',
        title: 'Social Expression Duo',
        title_ko: '소셜 표현의 듀오',
        synergy: {
          description: "Butterfly's emotion meets Penguin's networking - creating vibrant communities",
          description_ko: '나비의 감정과 펭귄의 네트워킹이 만나 활기찬 커뮤니티를 만듭니다'
        },
        recommendedExhibitions: [
          'Group exhibition openings',
          'Art fair networking events',
          'Community art projects',
          'Social art initiatives'
        ],
        recommendedExhibitions_ko: [
          '그룹전 오프닝',
          '아트페어 네트워킹',
          '커뮤니티 아트 프로젝트',
          '소셜 아트 이니셔티브'
        ],
        conversationExamples: [{
          person1: "Feel the energy in this room!",
          person1_ko: "이 공간의 에너지를 느껴봐!",
          person2: "Let me introduce you to the artist!",
          person2_ko: "작가님을 소개해줄게!"
        }],
        tips: {
          for_type1: "Penguin knows everyone - use their connections wisely",
          for_type1_ko: "펭귄은 모든 사람을 알아요 - 그들의 인맥을 현명하게 활용하세요",
          for_type2: "Butterfly's enthusiasm is contagious - let it spread",
          for_type2_ko: "나비의 열정은 전염성이 있어요 - 퍼지게 하세요"
        }
      };
    }
    
    // SAEF-SRMC (상호보완적 관계)
    if ((type1 === 'SAEF' && type2 === 'SRMC') || (type1 === 'SRMC' && type2 === 'SAEF')) {
      return {
        type1: 'SAEF',
        type2: 'SRMC',
        compatibility: 'challenging',
        title: 'Heart meets Mind',
        title_ko: '마음과 머리의 만남',
        synergy: {
          description: "Butterfly's pure emotion balances Eagle's analytical approach - both grow",
          description_ko: '나비의 순수한 감정이 독수리의 분석적 접근을 균형잡아주며 서로 성장합니다'
        },
        recommendedExhibitions: [
          'Exhibitions with audio guides',
          'Art education programs',
          'Structured gallery tours',
          'Mixed media exhibitions'
        ],
        recommendedExhibitions_ko: [
          '오디오 가이드 전시',
          '예술 교육 프로그램',
          '구조화된 갤러리 투어',
          '복합 매체 전시'
        ],
        conversationExamples: [{
          person1: "It just makes me happy!",
          person1_ko: "그냥 행복해져!",
          person2: "The artist's technique here is fascinating because...",
          person2_ko: "여기 작가의 기법이 흥미로운 이유는..."
        }],
        tips: {
          for_type1: "Eagle's knowledge can deepen your experience - stay open",
          for_type1_ko: "독수리의 지식은 경험을 깊게 해줄 수 있어요 - 열린 마음을 가지세요",
          for_type2: "Butterfly reminds you art is about feeling too - embrace it",
          for_type2_ko: "나비는 예술이 감정에 관한 것임을 상기시켜요 - 받아들이세요"
        }
      };
    }
    
    // LAMF(올빼미)의 케미스트리
    if ((type1 === 'LAMF' && type2 === 'SREF') || (type1 === 'SREF' && type2 === 'LAMF')) {
      return {
        type1: 'LAMF',
        type2: 'SREF',
        compatibility: 'challenging',
        title: 'Contemplation meets Action',
        title_ko: '사색과 행동의 만남',
        synergy: {
          description: "Owl's deep thinking complements Dog's energetic exploration - finding balance",
          description_ko: '올빼미의 깊은 사고가 강아지의 에너지 넘치는 탐험을 보완하며 균형을 찾습니다'
        },
        recommendedExhibitions: [
          'Short focused exhibitions',
          'Highlight tours',
          'Interactive installations',
          'Multi-sensory experiences'
        ],
        recommendedExhibitions_ko: [
          '짧고 집중된 전시',
          '하이라이트 투어',
          '인터랙티브 설치',
          '다감각 경험전'
        ],
        conversationExamples: [{
          person1: "I need time to contemplate this...",
          person1_ko: "이걸 숙고할 시간이 필요해...",
          person2: "But there's so much more to see!",
          person2_ko: "하지만 볼 게 훨씬 더 많아!"
        }],
        tips: {
          for_type1: "Dog's energy can help you discover new perspectives quickly",
          for_type1_ko: "강아지의 에너지는 새로운 관점을 빠르게 발견하도록 도와줘요",
          for_type2: "Owl's insights are worth the wait - slow down occasionally",
          for_type2_ko: "올빼미의 통찰은 기다릴 가치가 있어요 - 가끔은 속도를 늦추세요"
        }
      };
    }
    
    // LAMC(거북이)의 케미스트리
    if ((type1 === 'LAMC' && type2 === 'LRMC') || (type1 === 'LRMC' && type2 === 'LAMC')) {
      return {
        type1: 'LAMC',
        type2: 'LRMC',
        compatibility: 'good',
        title: 'Archive Masters Unite',
        title_ko: '아카이브 마스터의 연합',
        synergy: {
          description: "Turtle's collection meets Beaver's research - creating comprehensive knowledge",
          description_ko: '거북이의 수집과 비버의 연구가 만나 포괄적인 지식을 만듭니다'
        },
        recommendedExhibitions: [
          'Museum permanent collections',
          'Historical retrospectives',
          'Archive exhibitions',
          'Documentation projects'
        ],
        recommendedExhibitions_ko: [
          '박물관 상설 컬렉션',
          '역사적 회고전',
          '아카이브 전시',
          '기록 프로젝트'
        ],
        conversationExamples: [{
          person1: "I've been collecting information on this artist for years",
          person1_ko: "이 작가에 대한 정보를 수년간 수집해왔어",
          person2: "I have research that might complement your collection",
          person2_ko: "당신의 컬렉션을 보완할 수 있는 연구가 있어요"
        }],
        tips: {
          for_type1: "Beaver's research methods can enhance your collection",
          for_type1_ko: "비버의 연구 방법이 당신의 컬렉션을 향상시킬 수 있어요",
          for_type2: "Turtle's patience reveals hidden treasures - learn from it",
          for_type2_ko: "거북이의 인내심은 숨겨진 보물을 드러내요 - 배우세요"
        }
      };
    }
    
    // LAMC-SREF (상호보완적 관계)
    if ((type1 === 'LAMC' && type2 === 'SREF') || (type1 === 'SREF' && type2 === 'LAMC')) {
      return {
        type1: 'LAMC',
        type2: 'SREF',
        compatibility: 'challenging',
        title: 'Slow and Fast',
        title_ko: '느림과 빠름',
        synergy: {
          description: "Turtle's methodical pace challenges Dog's speed - both learn patience and efficiency",
          description_ko: '거북이의 체계적인 속도가 강아지의 속도에 도전하며 서로 인내와 효율을 배웁니다'
        },
        recommendedExhibitions: [
          'Exhibitions with varied pacing',
          'Self-guided tours',
          'Digital interactive displays',
          'Time-based media art'
        ],
        recommendedExhibitions_ko: [
          '다양한 속도의 전시',
          '셀프 가이드 투어',
          '디지털 인터랙티브 전시',
          '시간 기반 미디어 아트'
        ],
        conversationExamples: [{
          person1: "Let me examine this piece thoroughly",
          person1_ko: "이 작품을 철저히 살펴볼게",
          person2: "Quick look and move on!",
          person2_ko: "빠르게 보고 넘어가자!"
        }],
        tips: {
          for_type1: "Dog shows you can enjoy art without analyzing everything",
          for_type1_ko: "강아지는 모든 것을 분석하지 않고도 예술을 즐길 수 있음을 보여줘요",
          for_type2: "Turtle teaches that some art needs time to appreciate fully",
          for_type2_ko: "거북이는 어떤 예술은 완전히 감상하려면 시간이 필요함을 가르쳐요"
        }
      };
    }
    
    // LREF(카멜레온)의 케미스트리
    if ((type1 === 'LREF' && type2 === 'LREC') || (type1 === 'LREC' && type2 === 'LREF')) {
      return {
        type1: 'LREF',
        type2: 'LREC',
        compatibility: 'good',
        title: 'Sensitive Souls Meeting',
        title_ko: '섬세한 영혼들의 만남',
        synergy: {
          description: "Chameleon's color perception meets Deer's delicate emotions - creating subtle beauty",
          description_ko: '카멜레온의 색채 지각과 사슴의 섬세한 감정이 만나 미묘한 아름다움을 만듭니다'
        },
        recommendedExhibitions: [
          'Watercolor exhibitions',
          'Subtle installation art',
          'Nature-inspired galleries',
          'Quiet contemplative spaces'
        ],
        recommendedExhibitions_ko: [
          '수채화 전시',
          '섬세한 설치 미술',
          '자연 영감 갤러리',
          '조용한 명상 공간'
        ],
        conversationExamples: [{
          person1: "The way light changes this color...",
          person1_ko: "빛이 이 색을 바꾸는 방식이...",
          person2: "It reminds me of morning mist",
          person2_ko: "아침 안개가 떠올라"
        }],
        tips: {
          for_type1: "Deer appreciates your sensitivity - share subtle observations",
          for_type1_ko: "사슴은 당신의 민감함을 높이 평가해요 - 미묘한 관찰을 나누세요",
          for_type2: "Chameleon sees colors you might miss - ask about them",
          for_type2_ko: "카멜레온은 당신이 놓칠 수 있는 색을 봐요 - 물어보세요"
        }
      };
    }
    
    if ((type1 === 'LREF' && type2 === 'SREC') || (type1 === 'SREC' && type2 === 'LREF')) {
      return {
        type1: 'LREF',
        type2: 'SREC',
        compatibility: 'good',
        title: 'Color meets Structure',
        title_ko: '색채와 구조의 만남',
        synergy: {
          description: "Chameleon's aesthetic sense meets Duck's organizational skills - beautiful efficiency",
          description_ko: '카멜레온의 미적 감각과 오리의 조직력이 만나 아름다운 효율성을 만듭니다'
        },
        recommendedExhibitions: [
          'Curated color exhibitions',
          'Well-organized retrospectives',
          'Design exhibitions',
          'Themed gallery tours'
        ],
        recommendedExhibitions_ko: [
          '큐레이션된 색채 전시',
          '잘 조직된 회고전',
          '디자인 전시',
          '테마별 갤러리 투어'
        ],
        conversationExamples: [{
          person1: "This palette creates such harmony",
          person1_ko: "이 팔레트가 이런 조화를 만들어",
          person2: "Let me show you the best viewing route",
          person2_ko: "최적의 관람 동선을 보여줄게"
        }],
        tips: {
          for_type1: "Duck's structure helps showcase your aesthetic insights",
          for_type1_ko: "오리의 구조는 당신의 미적 통찰을 보여주는데 도움이 돼요",
          for_type2: "Chameleon adds beauty to your efficient plans",
          for_type2_ko: "카멜레온은 당신의 효율적인 계획에 아름다움을 더해요"
        }
      };
    }
    
    // LREF-SRMC (상호보완적 관계)
    if ((type1 === 'LREF' && type2 === 'SRMC') || (type1 === 'SRMC' && type2 === 'LREF')) {
      return {
        type1: 'LREF',
        type2: 'SRMC',
        compatibility: 'challenging',
        title: 'Feeling meets Analysis',
        title_ko: '느낌과 분석의 만남',
        synergy: {
          description: "Chameleon's intuitive color sense challenges Eagle's logical approach - expanding perspectives",
          description_ko: '카멜레온의 직관적 색채 감각이 독수리의 논리적 접근에 도전하며 관점을 확장합니다'
        },
        recommendedExhibitions: [
          'Art history exhibitions',
          'Technical art displays',
          'Color theory exhibitions',
          'Mixed interpretation tours'
        ],
        recommendedExhibitions_ko: [
          '미술사 전시',
          '기술적 예술 전시',
          '색채 이론 전시',
          '복합 해석 투어'
        ],
        conversationExamples: [{
          person1: "I feel this color differently",
          person1_ko: "이 색이 다르게 느껴져",
          person2: "Historically, this pigment was created by...",
          person2_ko: "역사적으로 이 안료는 이렇게 만들어졌는데..."
        }],
        tips: {
          for_type1: "Eagle's knowledge adds depth to your color perceptions",
          for_type1_ko: "독수리의 지식은 당신의 색채 지각에 깊이를 더해요",
          for_type2: "Chameleon reminds you art isn't just facts - feel it too",
          for_type2_ko: "카멜레온은 예술이 단순한 사실이 아님을 상기시켜요 - 느껴보세요"
        }
      };
    }
    
    // LREC(사슴)의 케미스트리
    if ((type1 === 'LREC' && type2 === 'LAMC') || (type1 === 'LAMC' && type2 === 'LREC')) {
      return {
        type1: 'LREC',
        type2: 'LAMC',
        compatibility: 'good',
        title: 'Quiet Appreciation',
        title_ko: '조용한 감상의 시간',
        synergy: {
          description: "Deer's gentle observation meets Turtle's patient collection - peaceful discovery",
          description_ko: '사슴의 부드러운 관찰과 거북이의 인내심 있는 수집이 만나 평화로운 발견을 합니다'
        },
        recommendedExhibitions: [
          'Permanent collections',
          'Quiet gallery spaces',
          'Nature art exhibitions',
          'Meditative installations'
        ],
        recommendedExhibitions_ko: [
          '상설 컬렉션',
          '조용한 갤러리 공간',
          '자연 예술 전시',
          '명상적 설치 작품'
        ],
        conversationExamples: [{
          person1: "This piece speaks softly...",
          person1_ko: "이 작품이 조용히 말하네...",
          person2: "I've been studying it for years",
          person2_ko: "수년간 연구해온 작품이야"
        }],
        tips: {
          for_type1: "Turtle's knowledge enriches your gentle observations",
          for_type1_ko: "거북이의 지식이 당신의 부드러운 관찰을 풍부하게 해요",
          for_type2: "Deer's sensitivity reveals new aspects in familiar works",
          for_type2_ko: "사슴의 민감함은 익숙한 작품에서 새로운 면을 드러내요"
        }
      };
    }
    
    // LREC-SREF (상호보완적 관계)
    if ((type1 === 'LREC' && type2 === 'SREF') || (type1 === 'SREF' && type2 === 'LREC')) {
      return {
        type1: 'LREC',
        type2: 'SREF',
        compatibility: 'challenging',
        title: 'Gentle meets Energetic',
        title_ko: '부드러움과 활력의 만남',
        synergy: {
          description: "Deer's quiet sensitivity contrasts Dog's boundless energy - teaching balance",
          description_ko: '사슴의 조용한 민감함이 강아지의 무한한 에너지와 대조되며 균형을 가르칩니다'
        },
        recommendedExhibitions: [
          'Varied pace exhibitions',
          'Indoor/outdoor combined shows',
          'Interactive yet contemplative art',
          'Multi-room experiences'
        ],
        recommendedExhibitions_ko: [
          '다양한 속도의 전시',
          '실내외 결합 전시',
          '상호작용적이면서도 사색적인 예술',
          '다중 공간 체험'
        ],
        conversationExamples: [{
          person1: "I need quiet to feel this",
          person1_ko: "이걸 느끼려면 조용함이 필요해",
          person2: "Come on, next room is exciting!",
          person2_ko: "가자, 다음 방이 신나!"
        }],
        tips: {
          for_type1: "Dog's enthusiasm can help you discover joy in unexpected places",
          for_type1_ko: "강아지의 열정은 예상치 못한 곳에서 기쁨을 발견하도록 도와요",
          for_type2: "Deer shows that some beauty requires stillness to perceive",
          for_type2_ko: "사슴은 어떤 아름다움은 고요함 속에서만 인지됨을 보여줘요"
        }
      };
    }
    
    // LRMF(수달)의 케미스트리
    if ((type1 === 'LRMF' && type2 === 'LRMC') || (type1 === 'LRMC' && type2 === 'LRMF')) {
      return {
        type1: 'LRMF',
        type2: 'LRMC',
        compatibility: 'good',
        title: 'Research Partners',
        title_ko: '연구 파트너',
        synergy: {
          description: "Otter's intuitive research meets Beaver's systematic approach - comprehensive understanding",
          description_ko: '수달의 직관적 연구와 비버의 체계적 접근이 만나 포괄적 이해를 만듭니다'
        },
        recommendedExhibitions: [
          'Academic exhibitions',
          'Research-based art',
          'Documentary exhibitions',
          'Artist study exhibitions'
        ],
        recommendedExhibitions_ko: [
          '학술 전시',
          '연구 기반 예술',
          '다큐멘터리 전시',
          '작가 연구 전시'
        ],
        conversationExamples: [{
          person1: "My intuition tells me there's more here",
          person1_ko: "직감적으로 여기 더 많은 게 있어",
          person2: "Let me check my research notes",
          person2_ko: "내 연구 노트를 확인해볼게"
        }],
        tips: {
          for_type1: "Beaver's systematic approach complements your intuition",
          for_type1_ko: "비버의 체계적 접근이 당신의 직관을 보완해요",
          for_type2: "Otter's hunches often lead to important discoveries",
          for_type2_ko: "수달의 직감은 종종 중요한 발견으로 이어져요"
        }
      };
    }
    
    // LRMF(수달)의 나머지 케미스트리
    if ((type1 === 'LRMF' && type2 === 'LAMC') || (type1 === 'LAMC' && type2 === 'LRMF')) {
      return {
        type1: 'LRMF',
        type2: 'LAMC',
        compatibility: 'good',
        title: 'Deep Dive Duo',
        title_ko: '심층 탐구 듀오',
        synergy: {
          description: "Otter's focused research meets Turtle's vast collection - thorough exploration",
          description_ko: '수달의 집중 연구와 거북이의 방대한 수집이 만나 철저한 탐구를 합니다'
        },
        recommendedExhibitions: [
          'In-depth retrospectives',
          'Archival exhibitions',
          'Artist monographs',
          'Historical surveys'
        ],
        recommendedExhibitions_ko: [
          '심층 회고전',
          '아카이브 전시',
          '작가 모노그래프',
          '역사적 조사전'
        ],
        conversationExamples: [{
          person1: "This connects to their earlier work",
          person1_ko: "이건 그들의 초기 작품과 연결돼",
          person2: "I have the complete timeline documented",
          person2_ko: "완전한 연대표를 기록해놨어"
        }],
        tips: {
          for_type1: "Turtle's archives support your deep dives",
          for_type1_ko: "거북이의 아카이브가 당신의 심층 탐구를 지원해요",
          for_type2: "Otter's focused research adds new dimensions to your collection",
          for_type2_ko: "수달의 집중 연구가 당신의 컬렉션에 새로운 차원을 더해요"
        }
      };
    }
    
    if ((type1 === 'LRMF' && type2 === 'SRMF') || (type1 === 'SRMF' && type2 === 'LRMF')) {
      return {
        type1: 'LRMF',
        type2: 'SRMF',
        compatibility: 'good',
        title: 'Knowledge Sharers',
        title_ko: '지식 공유자',
        synergy: {
          description: "Otter's intuitive insights meet Elephant's systematic teaching - wisdom flows",
          description_ko: '수달의 직관적 통찰과 코끼리의 체계적 교육이 만나 지혜가 흐릅니다'
        },
        recommendedExhibitions: [
          'Educational exhibitions',
          'Guided tours',
          'Workshop exhibitions',
          'Interactive learning spaces'
        ],
        recommendedExhibitions_ko: [
          '교육 전시',
          '가이드 투어',
          '워크샵 전시',
          '상호작용 학습 공간'
        ],
        conversationExamples: [{
          person1: "I sense a pattern here",
          person1_ko: "여기 패턴이 느껴져",
          person2: "Let me explain the historical context",
          person2_ko: "역사적 맥락을 설명해줄게"
        }],
        tips: {
          for_type1: "Elephant's teaching skills help share your insights",
          for_type1_ko: "코끼리의 교육 기술이 당신의 통찰을 공유하는데 도움돼요",
          for_type2: "Otter's intuition reveals teaching moments you might miss",
          for_type2_ko: "수달의 직관이 놓칠 수 있는 교육 순간을 드러내요"
        }
      };
    }
    
    // LRMF-SAEF (상호보완적 관계)
    if ((type1 === 'LRMF' && type2 === 'SAEF') || (type1 === 'SAEF' && type2 === 'LRMF')) {
      return {
        type1: 'LRMF',
        type2: 'SAEF',
        compatibility: 'challenging',
        title: 'Research meets Emotion',
        title_ko: '연구와 감정의 만남',
        synergy: {
          description: "Otter's deep analysis contrasts Butterfly's pure feeling - bridging mind and heart",
          description_ko: '수달의 깊은 분석이 나비의 순수한 감정과 대조되며 마음과 머리를 연결합니다'
        },
        recommendedExhibitions: [
          'Contemporary installations',
          'Emotional documentary art',
          'Research-based emotional art',
          'Mixed media experiences'
        ],
        recommendedExhibitions_ko: [
          '현대 설치 미술',
          '감정적 다큐멘터리 아트',
          '연구 기반 감정 예술',
          '복합 매체 경험'
        ],
        conversationExamples: [{
          person1: "The research shows this technique...",
          person1_ko: "연구에 따르면 이 기법은...",
          person2: "But how does it make you FEEL?",
          person2_ko: "하지만 어떤 느낌이 들어?"
        }],
        tips: {
          for_type1: "Butterfly reminds you art touches hearts, not just minds",
          for_type1_ko: "나비는 예술이 머리뿐 아니라 마음을 움직인다는 걸 상기시켜요",
          for_type2: "Otter's research adds depth to your emotional responses",
          for_type2_ko: "수달의 연구가 당신의 감정적 반응에 깊이를 더해요"
        }
      };
    }
    
    // LRMC(비버)의 나머지 케미스트리 (이미 SRMF, LRMF는 있음)
    if ((type1 === 'LRMC' && type2 === 'LAMF') || (type1 === 'LAMF' && type2 === 'LRMC')) {
      return {
        type1: 'LRMC',
        type2: 'LAMF',
        compatibility: 'good',
        title: 'Knowledge Philosophers',
        title_ko: '지식의 철학자들',
        synergy: {
          description: "Beaver's systematic research meets Owl's philosophical insights - profound understanding",
          description_ko: '비버의 체계적 연구와 올빼미의 철학적 통찰이 만나 심오한 이해를 만듭니다'
        },
        recommendedExhibitions: [
          'Conceptual art exhibitions',
          'Philosophy and art shows',
          'Research presentations',
          'Academic symposiums'
        ],
        recommendedExhibitions_ko: [
          '개념 미술 전시',
          '철학과 예술 전시',
          '연구 발표회',
          '학술 심포지엄'
        ],
        conversationExamples: [{
          person1: "My data suggests a trend",
          person1_ko: "내 데이터가 보여주는 경향은",
          person2: "But what does it mean existentially?",
          person2_ko: "하지만 존재론적으로 무슨 의미일까?"
        }],
        tips: {
          for_type1: "Owl's wisdom adds meaning to your research",
          for_type1_ko: "올빼미의 지혜가 당신의 연구에 의미를 더해요",
          for_type2: "Beaver's data supports your philosophical insights",
          for_type2_ko: "비버의 데이터가 당신의 철학적 통찰을 뒷받침해요"
        }
      };
    }
    
    // LRMC-SAEF (상호보완적 관계)
    if ((type1 === 'LRMC' && type2 === 'SAEF') || (type1 === 'SAEF' && type2 === 'LRMC')) {
      return {
        type1: 'LRMC',
        type2: 'SAEF',
        compatibility: 'challenging',
        title: 'Data meets Joy',
        title_ko: '데이터와 기쁨의 만남',
        synergy: {
          description: "Beaver's careful research contrasts Butterfly's spontaneous joy - finding balance",
          description_ko: '비버의 신중한 연구가 나비의 자발적 기쁨과 대조되며 균형을 찾습니다'
        },
        recommendedExhibitions: [
          'Interactive data visualizations',
          'Playful educational exhibits',
          'Science meets art shows',
          'Discovery centers'
        ],
        recommendedExhibitions_ko: [
          '인터랙티브 데이터 시각화',
          '놀이형 교육 전시',
          '과학과 예술의 만남',
          '디스커버리 센터'
        ],
        conversationExamples: [{
          person1: "According to my analysis...",
          person1_ko: "내 분석에 따르면...",
          person2: "Wow, it sparkles!",
          person2_ko: "와, 반짝반짝해!"
        }],
        tips: {
          for_type1: "Butterfly shows data can be delightful too",
          for_type1_ko: "나비는 데이터도 즐거울 수 있음을 보여줘요",
          for_type2: "Beaver's research reveals the magic behind the sparkle",
          for_type2_ko: "비버의 연구는 반짝임 뒤의 마법을 드러내요"
        }
      };
    }
    
    // SAEC(펭귄)의 나머지 케미스트리
    if ((type1 === 'SAEC' && type2 === 'LAEC') || (type1 === 'LAEC' && type2 === 'SAEC')) {
      return {
        type1: 'SAEC',
        type2: 'LAEC',
        compatibility: 'good',
        title: 'Social meets Solitary',
        title_ko: '사교와 고독의 만남',
        synergy: {
          description: "Penguin's networking balances Cat's selective curation - quality connections",
          description_ko: '펭귄의 네트워킹이 고양이의 선택적 큐레이션과 균형을 이루며 질 높은 연결을 만듭니다'
        },
        recommendedExhibitions: [
          'Exclusive gallery events',
          'Curated small exhibitions',
          'Artist talks',
          'VIP preview events'
        ],
        recommendedExhibitions_ko: [
          '독점 갤러리 이벤트',
          '큐레이션된 소규모 전시',
          '작가와의 대화',
          'VIP 프리뷰 행사'
        ],
        conversationExamples: [{
          person1: "Let me introduce you to everyone!",
          person1_ko: "모두에게 소개해줄게!",
          person2: "I prefer meaningful connections",
          person2_ko: "의미 있는 연결을 선호해"
        }],
        tips: {
          for_type1: "Cat teaches quality over quantity in connections",
          for_type1_ko: "고양이는 연결에서 양보다 질을 가르쳐요",
          for_type2: "Penguin helps you expand your carefully curated circle",
          for_type2_ko: "펭귄은 신중하게 큐레이션된 당신의 서클을 확장하도록 도와요"
        }
      };
    }
    
    // SAEC-LAMC (상호보완적 관계)
    if ((type1 === 'SAEC' && type2 === 'LAMC') || (type1 === 'LAMC' && type2 === 'SAEC')) {
      return {
        type1: 'SAEC',
        type2: 'LAMC',
        compatibility: 'challenging',
        title: 'Networker meets Archivist',
        title_ko: '네트워커와 아키비스트의 만남',
        synergy: {
          description: "Penguin's social energy contrasts Turtle's solitary collection - learning patience and connection",
          description_ko: '펭귄의 사교적 에너지가 거북이의 고독한 수집과 대조되며 인내와 연결을 배웁니다'
        },
        recommendedExhibitions: [
          'Archive opening events',
          'Collection database launches',
          'Digital archive tours',
          'Historical society events'
        ],
        recommendedExhibitions_ko: [
          '아카이브 오픈 이벤트',
          '컬렉션 데이터베이스 런칭',
          '디지털 아카이브 투어',
          '역사 학회 행사'
        ],
        conversationExamples: [{
          person1: "This would be great for sharing!",
          person1_ko: "이건 공유하기 좋겠다!",
          person2: "Some treasures are meant to be preserved quietly",
          person2_ko: "어떤 보물은 조용히 보존되어야 해"
        }],
        tips: {
          for_type1: "Turtle shows the value of deep, quiet appreciation",
          for_type1_ko: "거북이는 깊고 조용한 감상의 가치를 보여줘요",
          for_type2: "Penguin brings your archives to appreciative audiences",
          for_type2_ko: "펭귄은 당신의 아카이브를 감사하는 관객에게 전달해요"
        }
      };
    }
    
    // SAMF(앵무새)의 추가 케미스트리
    if ((type1 === 'SAMF' && type2 === 'SAEC') || (type1 === 'SAEC' && type2 === 'SAMF')) {
      return {
        type1: 'SAMF',
        type2: 'SAEC',
        compatibility: 'good',
        title: 'Expression and Connection',
        title_ko: '표현과 연결',
        synergy: {
          description: "Parrot's expressive sharing meets Penguin's social networking - vibrant community",
          description_ko: '앵무새의 표현적 공유와 펭귄의 소셜 네트워킹이 만나 활기찬 커뮤니티를 만듭니다'
        },
        recommendedExhibitions: [
          'Interactive community art',
          'Social practice exhibitions',
          'Participatory installations',
          'Art festival events'
        ],
        recommendedExhibitions_ko: [
          '인터랙티브 커뮤니티 아트',
          '사회적 실천 전시',
          '참여형 설치 작품',
          '아트 페스티벌 이벤트'
        ],
        conversationExamples: [{
          person1: "I must share this feeling!",
          person1_ko: "이 느낌을 나눠야겠어!",
          person2: "I know just the right people!",
          person2_ko: "딱 맞는 사람들을 알아!"
        }],
        tips: {
          for_type1: "Penguin's network amplifies your expression",
          for_type1_ko: "펭귄의 네트워크가 당신의 표현을 증폭시켜요",
          for_type2: "Parrot's enthusiasm energizes your connections",
          for_type2_ko: "앵무새의 열정이 당신의 연결에 활력을 불어넣어요"
        }
      };
    }
    
    if ((type1 === 'SAMF' && type2 === 'SAEF') || (type1 === 'SAEF' && type2 === 'SAMF')) {
      return {
        type1: 'SAMF',
        type2: 'SAEF',
        compatibility: 'good',
        title: 'Emotional Expression Duo',
        title_ko: '감정 표현 듀오',
        synergy: {
          description: "Parrot's verbal expression meets Butterfly's emotional depth - feelings flow freely",
          description_ko: '앵무새의 언어적 표현과 나비의 감정적 깊이가 만나 감정이 자유롭게 흐릅니다'
        },
        recommendedExhibitions: [
          'Emotional art installations',
          'Expression workshops',
          'Performance art',
          'Interactive emotional experiences'
        ],
        recommendedExhibitions_ko: [
          '감정 예술 설치',
          '표현 워크샵',
          '퍼포먼스 아트',
          '인터랙티브 감정 체험'
        ],
        conversationExamples: [{
          person1: "Let me tell you how this feels!",
          person1_ko: "이게 어떤 느낌인지 말해줄게!",
          person2: "Yes! I feel it too!",
          person2_ko: "맞아! 나도 느껴져!"
        }],
        tips: {
          for_type1: "Butterfly validates your expressive nature",
          for_type1_ko: "나비는 당신의 표현적 본성을 인정해줘요",
          for_type2: "Parrot helps articulate your deep feelings",
          for_type2_ko: "앵무새는 당신의 깊은 감정을 표현하도록 도와요"
        }
      };
    }
    
    // SAMC(벌)의 나머지 케미스트리
    if ((type1 === 'SAMC' && type2 === 'SRMC') || (type1 === 'SRMC' && type2 === 'SAMC')) {
      return {
        type1: 'SAMC',
        type2: 'SRMC',
        compatibility: 'good',
        title: 'Systematic Networkers',
        title_ko: '체계적 네트워커',
        synergy: {
          description: "Bee's community building meets Eagle's analytical systems - organized excellence",
          description_ko: '벌의 커뮤니티 구축과 독수리의 분석적 시스템이 만나 조직화된 우수성을 만듭니다'
        },
        recommendedExhibitions: [
          'Large museum retrospectives',
          'Well-organized biennales',
          'Systematic collection displays',
          'Educational programs'
        ],
        recommendedExhibitions_ko: [
          '대형 박물관 회고전',
          '잘 조직된 비엔날레',
          '체계적 컬렉션 전시',
          '교육 프로그램'
        ],
        conversationExamples: [{
          person1: "Let's organize a group tour",
          person1_ko: "그룹 투어를 조직해보자",
          person2: "I've analyzed the optimal route",
          person2_ko: "최적 경로를 분석했어"
        }],
        tips: {
          for_type1: "Eagle's analysis strengthens your community programs",
          for_type1_ko: "독수리의 분석이 당신의 커뮤니티 프로그램을 강화해요",
          for_type2: "Bee's networking adds warmth to your systems",
          for_type2_ko: "벌의 네트워킹이 당신의 시스템에 따뜻함을 더해요"
        }
      };
    }
    
    if ((type1 === 'SAMC' && type2 === 'SRMF') || (type1 === 'SRMF' && type2 === 'SAMC')) {
      return {
        type1: 'SAMC',
        type2: 'SRMF',
        compatibility: 'good',
        title: 'Community Teachers',
        title_ko: '커뮤니티 교육자',
        synergy: {
          description: "Bee's organized communities meet Elephant's knowledge sharing - learning thrives",
          description_ko: '벌의 조직화된 커뮤니티와 코끼리의 지식 공유가 만나 학습이 번성합니다'
        },
        recommendedExhibitions: [
          'Community education programs',
          'Group learning experiences',
          'Collaborative workshops',
          'Knowledge exchange events'
        ],
        recommendedExhibitions_ko: [
          '커뮤니티 교육 프로그램',
          '그룹 학습 경험',
          '협업 워크샵',
          '지식 교류 행사'
        ],
        conversationExamples: [{
          person1: "Our group would love to learn",
          person1_ko: "우리 그룹이 배우고 싶어해",
          person2: "I'll prepare a comprehensive guide",
          person2_ko: "포괄적인 가이드를 준비할게"
        }],
        tips: {
          for_type1: "Elephant's teaching enriches your community",
          for_type1_ko: "코끼리의 가르침이 당신의 커뮤니티를 풍부하게 해요",
          for_type2: "Bee's organization helps spread your knowledge effectively",
          for_type2_ko: "벌의 조직력이 당신의 지식을 효과적으로 전파하도록 도와요"
        }
      };
    }
    
    // SAMC-LAEF (상호보완적 관계)
    if ((type1 === 'SAMC' && type2 === 'LAEF') || (type1 === 'LAEF' && type2 === 'SAMC')) {
      return {
        type1: 'SAMC',
        type2: 'LAEF',
        compatibility: 'challenging',
        title: 'Collective meets Individual',
        title_ko: '집단과 개인의 만남',
        synergy: {
          description: "Bee's community focus contrasts Fox's solitary dreams - finding personal space in groups",
          description_ko: '벌의 커뮤니티 중심과 여우의 고독한 꿈이 대조되며 그룹 속 개인 공간을 찾습니다'
        },
        recommendedExhibitions: [
          'Exhibitions with quiet corners',
          'Mixed social/solitary spaces',
          'Contemplative group experiences',
          'Silent disco art tours'
        ],
        recommendedExhibitions_ko: [
          '조용한 코너가 있는 전시',
          '사교/고독 혼합 공간',
          '사색적 그룹 경험',
          '사일런트 디스코 아트 투어'
        ],
        conversationExamples: [{
          person1: "Everyone should experience this together",
          person1_ko: "모두가 함께 경험해야 해",
          person2: "I need my own space to feel",
          person2_ko: "느끼려면 나만의 공간이 필요해"
        }],
        tips: {
          for_type1: "Fox reminds you individuals need space within community",
          for_type1_ko: "여우는 커뮤니티 안에서도 개인이 공간이 필요함을 상기시켜요",
          for_type2: "Bee shows that shared experiences can deepen personal insights",
          for_type2_ko: "벌은 공유된 경험이 개인적 통찰을 깊게 할 수 있음을 보여줘요"
        }
      };
    }
    
    // SREF(강아지)의 나머지 케미스트리
    if ((type1 === 'SREF' && type2 === 'SREC') || (type1 === 'SREC' && type2 === 'SREF')) {
      return {
        type1: 'SREF',
        type2: 'SREC',
        compatibility: 'good',
        title: 'Efficient Explorers',
        title_ko: '효율적 탐험가',
        synergy: {
          description: "Dog's energetic exploration meets Duck's organized guidance - maximum discovery",
          description_ko: '강아지의 에너지 넘치는 탐험과 오리의 조직된 안내가 만나 최대한의 발견을 합니다'
        },
        recommendedExhibitions: [
          'Large-scale exhibitions',
          'Art fairs',
          'Multi-venue events',
          'Gallery hopping tours'
        ],
        recommendedExhibitions_ko: [
          '대규모 전시',
          '아트 페어',
          '다중 장소 이벤트',
          '갤러리 호핑 투어'
        ],
        conversationExamples: [{
          person1: "So much to see!",
          person1_ko: "볼 게 너무 많아!",
          person2: "Follow my optimized route!",
          person2_ko: "내 최적화된 경로를 따라와!"
        }],
        tips: {
          for_type1: "Duck's system helps you see everything efficiently",
          for_type1_ko: "오리의 시스템이 모든 것을 효율적으로 보도록 도와요",
          for_type2: "Dog's enthusiasm keeps the journey exciting",
          for_type2_ko: "강아지의 열정이 여정을 흥미롭게 유지해요"
        }
      };
    }
    
    if ((type1 === 'SREF' && type2 === 'SAEF') || (type1 === 'SAEF' && type2 === 'SREF')) {
      return {
        type1: 'SREF',
        type2: 'SAEF',
        compatibility: 'good',
        title: 'Joyful Discoverers',
        title_ko: '즐거운 발견자',
        synergy: {
          description: "Dog's playful energy meets Butterfly's emotional joy - pure artistic delight",
          description_ko: '강아지의 장난스러운 에너지와 나비의 감정적 기쁨이 만나 순수한 예술적 즐거움을 만듭니다'
        },
        recommendedExhibitions: [
          'Interactive installations',
          'Colorful exhibitions',
          'Playful art spaces',
          'Family-friendly shows'
        ],
        recommendedExhibitions_ko: [
          '인터랙티브 설치',
          '다채로운 전시',
          '놀이형 예술 공간',
          '가족 친화적 전시'
        ],
        conversationExamples: [{
          person1: "This is so fun!",
          person1_ko: "이거 너무 재밌어!",
          person2: "It makes me so happy!",
          person2_ko: "너무 행복해!"
        }],
        tips: {
          for_type1: "Butterfly's joy deepens your playful discoveries",
          for_type1_ko: "나비의 기쁨이 당신의 즐거운 발견을 깊게 해요",
          for_type2: "Dog's energy helps you explore joyfully",
          for_type2_ko: "강아지의 에너지가 즐겁게 탐험하도록 도와요"
        }
      };
    }
    
    // SREF(강아지)의 마지막 케미스트리
    if ((type1 === 'SREF' && type2 === 'SRMF') || (type1 === 'SRMF' && type2 === 'SREF')) {
      return {
        type1: 'SREF',
        type2: 'SRMF',
        compatibility: 'good',
        title: 'Quick Learners',
        title_ko: '빠른 학습자',
        synergy: {
          description: "Dog's quick exploration meets Elephant's patient teaching - efficient learning",
          description_ko: '강아지의 빠른 탐험과 코끼리의 인내심 있는 가르침이 만나 효율적 학습을 합니다'
        },
        recommendedExhibitions: [
          'Educational tours',
          'Highlight exhibitions',
          'Quick overview sessions',
          'Speed learning events'
        ],
        recommendedExhibitions_ko: [
          '교육 투어',
          '하이라이트 전시',
          '빠른 개요 세션',
          '스피드 러닝 이벤트'
        ],
        conversationExamples: [{
          person1: "Quick summary please!",
          person1_ko: "빠른 요약 부탁해!",
          person2: "Let me share the key points",
          person2_ko: "핵심 포인트를 공유할게"
        }],
        tips: {
          for_type1: "Elephant's knowledge satisfies your curiosity quickly",
          for_type1_ko: "코끼리의 지식이 당신의 호기심을 빠르게 만족시켜요",
          for_type2: "Dog's pace challenges you to teach efficiently",
          for_type2_ko: "강아지의 속도가 효율적으로 가르치도록 도전해요"
        }
      };
    }
    
    // SREC(오리)의 나머지 케미스트리
    if ((type1 === 'SREC' && type2 === 'SRMF') || (type1 === 'SRMF' && type2 === 'SREC')) {
      return {
        type1: 'SREC',
        type2: 'SRMF',
        compatibility: 'good',
        title: 'Exhibition Masters',
        title_ko: '전시의 달인',
        synergy: {
          description: "Duck's efficient guidance meets Elephant's comprehensive knowledge - perfect tours",
          description_ko: '오리의 효율적 안내와 코끼리의 포괄적 지식이 만나 완벽한 투어를 만듭니다'
        },
        recommendedExhibitions: [
          'Major museum tours',
          'Comprehensive exhibitions',
          'Educational gallery visits',
          'Docent-led experiences'
        ],
        recommendedExhibitions_ko: [
          '주요 박물관 투어',
          '종합 전시',
          '교육적 갤러리 방문',
          '도슨트 주도 경험'
        ],
        conversationExamples: [{
          person1: "Here's the optimal path",
          person1_ko: "여기가 최적 경로야",
          person2: "And here's what you'll learn",
          person2_ko: "그리고 이걸 배우게 될 거야"
        }],
        tips: {
          for_type1: "Elephant's knowledge enriches your efficient tours",
          for_type1_ko: "코끼리의 지식이 당신의 효율적인 투어를 풍부하게 해요",
          for_type2: "Duck's system helps organize your vast knowledge",
          for_type2_ko: "오리의 시스템이 당신의 방대한 지식을 조직화하도록 도와요"
        }
      };
    }
    
    // SREC-LAEC (상호보완적 관계)
    if ((type1 === 'SREC' && type2 === 'LAEC') || (type1 === 'LAEC' && type2 === 'SREC')) {
      return {
        type1: 'SREC',
        type2: 'LAEC',
        compatibility: 'challenging',
        title: 'Efficiency meets Aesthetics',
        title_ko: '효율성과 미학의 만남',
        synergy: {
          description: "Duck's practical approach contrasts Cat's aesthetic perfectionism - finding beautiful efficiency",
          description_ko: '오리의 실용적 접근이 고양이의 미적 완벽주의와 대조되며 아름다운 효율성을 찾습니다'
        },
        recommendedExhibitions: [
          'Well-curated exhibitions',
          'Design museums',
          'Architectural tours',
          'Minimalist galleries'
        ],
        recommendedExhibitions_ko: [
          '잘 큐레이션된 전시',
          '디자인 박물관',
          '건축 투어',
          '미니멀리스트 갤러리'
        ],
        conversationExamples: [{
          person1: "Let's cover everything quickly",
          person1_ko: "빠르게 다 둘러보자",
          person2: "Quality over quantity, please",
          person2_ko: "양보다 질이 중요해"
        }],
        tips: {
          for_type1: "Cat shows that some beauty requires time to appreciate",
          for_type1_ko: "고양이는 어떤 아름다움은 감상할 시간이 필요함을 보여줘요",
          for_type2: "Duck helps you share your refined taste efficiently",
          for_type2_ko: "오리는 당신의 세련된 취향을 효율적으로 공유하도록 도와요"
        }
      };
    }
    
    // SRMF(코끼리)의 마지막 케미스트리
    if ((type1 === 'SRMF' && type2 === 'SREC') || (type1 === 'SREC' && type2 === 'SRMF')) {
      return {
        type1: 'SRMF',
        type2: 'SREC',
        compatibility: 'good',
        title: 'Knowledge Guides',
        title_ko: '지식의 안내자',
        synergy: {
          description: "Elephant's teaching meets Duck's guidance - comprehensive learning journeys",
          description_ko: '코끼리의 가르침과 오리의 안내가 만나 포괄적인 학습 여정을 만듭니다'
        },
        recommendedExhibitions: [
          'Educational exhibitions',
          'Museum learning programs',
          'Guided study tours',
          'Workshop series'
        ],
        recommendedExhibitions_ko: [
          '교육 전시',
          '박물관 학습 프로그램',
          '가이드 스터디 투어',
          '워크샵 시리즈'
        ],
        conversationExamples: [{
          person1: "Let me explain the context",
          person1_ko: "맥락을 설명해줄게",
          person2: "And I'll guide us through",
          person2_ko: "그리고 내가 안내할게"
        }],
        tips: {
          for_type1: "Duck's structure helps deliver your knowledge effectively",
          for_type1_ko: "오리의 구조가 당신의 지식을 효과적으로 전달하도록 도와요",
          for_type2: "Elephant's wisdom adds depth to your guided tours",
          for_type2_ko: "코끼리의 지혜가 당신의 가이드 투어에 깊이를 더해요"
        }
      };
    }
    
    // SRMC(독수리)의 마지막 케미스트리
    if ((type1 === 'SRMC' && type2 === 'SRMC') || (type1 === 'SRMC' && type2 === 'SRMC')) {
      return {
        type1: 'SRMC',
        type2: 'SRMC',
        compatibility: 'good',
        title: 'Analytical Excellence',
        title_ko: '분석적 우수성',
        synergy: {
          description: "Two Eagles share deep analysis - comprehensive understanding achieved",
          description_ko: '두 독수리가 깊은 분석을 공유하며 포괄적 이해를 달성합니다'
        },
        recommendedExhibitions: [
          'Academic conferences',
          'Research exhibitions',
          'Scholarly presentations',
          'Expert symposiums'
        ],
        recommendedExhibitions_ko: [
          '학술 컨퍼런스',
          '연구 전시',
          '학술 발표',
          '전문가 심포지엄'
        ],
        conversationExamples: [{
          person1: "My analysis shows...",
          person1_ko: "내 분석에 따르면...",
          person2: "Interesting, my data suggests...",
          person2_ko: "흥미롭네, 내 데이터는..."
        }],
        tips: {
          for_type1: "Another Eagle validates and challenges your analysis",
          for_type1_ko: "다른 독수리가 당신의 분석을 검증하고 도전해요",
          for_type2: "Peer review strengthens both perspectives",
          for_type2_ko: "동료 검토가 양쪽 관점을 강화해요"
        }
      };
    }
    
    // SRMC-LRMC (비버와의 관계)
    if ((type1 === 'SRMC' && type2 === 'LRMC') || (type1 === 'LRMC' && type2 === 'SRMC')) {
      return {
        type1: 'SRMC',
        type2: 'LRMC',
        compatibility: 'good',
        title: 'Research Alliance',
        title_ko: '연구 동맹',
        synergy: {
          description: "Eagle's systematic analysis meets Beaver's deep research - knowledge powerhouse",
          description_ko: '독수리의 체계적 분석과 비버의 깊은 연구가 만나 지식의 강자가 됩니다'
        },
        recommendedExhibitions: [
          'Research archives',
          'Academic exhibitions',
          'Historical surveys',
          'Documentation projects'
        ],
        recommendedExhibitions_ko: [
          '연구 아카이브',
          '학술 전시',
          '역사적 조사',
          '문서화 프로젝트'
        ],
        conversationExamples: [{
          person1: "The data clearly indicates",
          person1_ko: "데이터가 명확히 보여주는 것은",
          person2: "My research confirms this pattern",
          person2_ko: "내 연구가 이 패턴을 확인해"
        }],
        tips: {
          for_type1: "Beaver's thorough research supports your analysis",
          for_type1_ko: "비버의 철저한 연구가 당신의 분석을 뒷받침해요",
          for_type2: "Eagle's systematic approach enhances your research",
          for_type2_ko: "독수리의 체계적 접근이 당신의 연구를 향상시켜요"
        }
      };
    }
    
    // 기본값 반환
    return null;
  };

  const getChemistryInfo = (type1: string, type2: string) => {
    // 먼저 기존 chemistry data에서 찾기
    const existing = chemistryData.find(
      (c) => (c.type1 === type1 && c.type2 === type2) || (c.type1 === type2 && c.type2 === type1)
    );
    if (existing) return existing;
    
    // 없으면 커스텀 케미스트리 생성
    return getCustomChemistryData(type1, type2);
  };

  // Main component render
  const desktopComponent = (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/images/backgrounds/classical-gallery-floor-sitting-contemplation.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            {language === 'ko' ? '예술 동행자 찾기' : 'Find Art Companions'}
          </h1>
          <p className="text-[1.125rem] text-gray-200 max-w-6xl mx-auto">
            {language === 'ko' 
              ? '당신과 잘 맞는 예술 동행자를 만나고, 함께 전시를 즐겨보세요.'
              : 'Meet art companions who match your aesthetic preferences and enjoy exhibitions together.'}
          </p>
        </motion.div>

        {/* User Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/30 shadow-xl"
        >
          <div className="flex items-center gap-4">
            {userAnimal && (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl">
                {userAnimal.emoji}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">
                {user.nickname || 'Explorer'}
              </h2>
              <p className="text-gray-100">
                {language === 'ko' 
                  ? `${userAnimal?.animal_ko} (${userPersonalityType}) - ${personalityDescriptions[userPersonalityType]?.title_ko}`
                  : `${userAnimal?.animal} (${userPersonalityType}) - ${personalityDescriptions[userPersonalityType]?.title}`}
              </p>
              <div className="flex gap-4 mt-2 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {language === 'ko' ? '관람 23회' : '23 visits'}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {language === 'ko' ? '작품 87개' : '87 artworks'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gender Filter for Matches Tab */}
        {activeTab === 'matches' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 bg-black/40 backdrop-blur-lg rounded-lg p-2"
          >
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                genderFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {language === 'ko' ? '전체' : 'All'}
            </button>
            <button
              onClick={() => setGenderFilter('opposite')}
              className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                genderFilter === 'opposite'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {language === 'ko' ? '이성만' : 'Opposite Gender'}
            </button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'matches', label: language === 'ko' ? '추천 동행자' : 'Recommended Companions', icon: Users },
            { id: 'exhibitions', label: language === 'ko' ? '전시 매칭' : 'Exhibition Matching', icon: Calendar },
            { id: 'forums', label: language === 'ko' ? '커뮤니티 포럼' : 'Community Forums', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-stone-800/40 text-gray-300 hover:bg-stone-700/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'matches' && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-5 gap-6"
            >
              {/* User List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {language === 'ko' ? '추천 예술 동행자' : 'Recommended Art Companions'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLikedOnly(!showLikedOnly)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
                        showLikedOnly 
                        ? 'bg-pink-600 text-white' 
                        : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'
                    }`}
                  >
                    {showLikedOnly ? '❤️ 좋아요만' : '전체 보기'}
                      {likedUsers.size > 0 && (
                        <span className="bg-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {likedUsers.size}
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1 ${
                        showFilters
                          ? 'bg-purple-600 text-white'
                          : 'bg-stone-700/50 text-gray-300 hover:bg-stone-600/50'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                      {language === 'ko' ? '필터' : 'Filter'}
                    </button>
                  </div>
                </div>
                
                {/* Filter Panel */}
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-black/60 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/40"
                  >
                    <div className="space-y-4">
                      {/* Age Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                          {language === 'ko' ? '나이 범위' : 'Age Range'}: {ageFilter.min} - {ageFilter.max}세
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="20"
                            max="70"
                            value={ageFilter.min}
                            onChange={(e) => setAgeFilter({ ...ageFilter, min: parseInt(e.target.value) })}
                            className="flex-1 accent-purple-600"
                          />
                          <span className="text-sm text-gray-300 w-10">{ageFilter.min}</span>
                          <input
                            type="range"
                            min="20"
                            max="70"
                            value={ageFilter.max}
                            onChange={(e) => setAgeFilter({ ...ageFilter, max: parseInt(e.target.value) })}
                            className="flex-1 accent-purple-600"
                          />
                          <span className="text-sm text-gray-300 w-10">{ageFilter.max}</span>
                        </div>
                      </div>
                      
                      {/* Distance Filter */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 block mb-2">
                          {language === 'ko' ? '거리' : 'Distance'}: {distanceFilter}km {language === 'ko' ? '이내' : 'or less'}
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={distanceFilter}
                            onChange={(e) => setDistanceFilter(parseInt(e.target.value))}
                            className="flex-1 accent-purple-600"
                          />
                          <span className="text-sm text-gray-300 w-16">{distanceFilter}km</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-gray-300">
                          {compatibleUsers.length}{language === 'ko' ? '명 표시중' : ' shown'}
                        </span>
                        <button
                          onClick={() => {
                            setAgeFilter({ min: 20, max: 50 });
                            setDistanceFilter(50);
                          }}
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          {language === 'ko' ? '초기화' : 'Reset'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div className="space-y-4">
                {compatibleUsers
                  .filter(match => !blockedUsers.has(match.id))
                  .filter(match => !showLikedOnly || likedUsers.has(match.id))
                  .map((match, index) => {
                    const matchAnimal = getAnimalByType(match.personalityType);
                    const chemistry = getChemistryInfo(userPersonalityType, match.personalityType);
                    const isLiked = likedUsers.has(match.id);
                    const isMutualLike = isLiked && match.hasLikedMe;
                    
                    return (
                      <motion.div
                        key={match.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-black/75 to-black/65 backdrop-blur-md rounded-2xl p-3 border border-white/40 hover:from-black/80 hover:to-black/70 hover:border-white/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedMatch(match)}>
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl overflow-hidden">
                            {match.avatar && match.avatar.startsWith('/') ? (
                              <img src={match.avatar} alt={match.nickname} className="w-full h-full object-cover" />
                            ) : (
                              match.avatar || matchAnimal?.emoji || '🎨'
                            )}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 flex items-center justify-center ${
                            index < 2 ? 'text-green-500' :
                            index === 2 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            <div className="relative">
                              <Heart className="w-7 h-7 fill-current" />
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                {match.compatibilityScore}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-purple-400">@</span>
                            <h4 className="font-semibold text-white text-lg drop-shadow-lg">{match.nickname}</h4>
                            {isMutualLike && (
                              <span className="text-xs bg-pink-600 text-white px-1.5 py-0.5 rounded-full">
                                {language === 'ko' ? '서로 좋아요' : 'Matched'} 💕
                              </span>
                            )}
                            {!isMutualLike && match.hasLikedMe && (
                              <span className="text-xs bg-pink-600/80 text-white px-2 py-1 rounded-full border border-pink-400/50 backdrop-blur-sm drop-shadow-lg">
                                {language === 'ko' ? '나를 좋아해요' : 'Likes you'} 💖
                              </span>
                            )}
                            <span className="text-xs text-gray-300 drop-shadow-sm">· {match.lastActive}</span>
                          </div>
                          <p className="text-sm text-gray-100 mb-2 leading-relaxed drop-shadow-md">
                            {matchAnimal?.animal_ko}({match.personalityType})
                            {chemistry ? ` - ${language === 'ko' ? chemistry.title_ko : chemistry.title}` : 
                             match.compatibility === 'perfect' ? ` - ${language === 'ko' ? '환상의 케미스트리' : 'Perfect Chemistry'}` :
                             match.compatibility === 'good' ? ` - ${language === 'ko' ? '좋은 시너지' : 'Good Synergy'}` :
                             match.compatibility === 'challenging' ? ` - ${language === 'ko' ? '흥미로운 대조' : 'Interesting Contrast'}` :
                             ` - ${language === 'ko' ? '새로운 관점' : 'New Perspectives'}`}
                          </p>
                          <div className="flex gap-3 text-xs text-white drop-shadow-sm">
                            {match.age && <span>{match.age}{language === 'ko' ? '세' : ' years'}</span>}
                            {match.distance && <span>{match.distance}km</span>}
                            <span>{language === 'ko' ? `전시 ${match.exhibitions}회` : `${match.exhibitions} exhibitions`}</span>
                            <span>{language === 'ko' ? `작품 ${match.artworks}개` : `${match.artworks} artworks`}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeToggle(match.id);
                          }}
                          className={`p-1.5 rounded-full transition-all ${
                            isLiked
                              ? 'bg-pink-600/80 text-white hover:bg-pink-700'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-pink-400'
                          }`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill={isLiked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(showMenu === match.id ? null : match.id);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/5 transition-colors opacity-50 hover:opacity-100"
                          >
                            <MoreVertical className="w-3 h-3 text-gray-500" />
                          </button>
                          
                          {showMenu === match.id && (
                            <div className="absolute left-full top-0 ml-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl py-1 px-2 z-[100] flex items-center gap-1 whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBlock(match.id);
                                  setShowMenu(null);
                                }}
                                className="text-xs text-gray-200 hover:text-white px-2 py-1 hover:bg-white/10 rounded transition-colors"
                              >
                                {language === 'ko' ? '차단' : 'Block'}
                              </button>
                              <span className="text-gray-200">|</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowReportModal(match.id);
                                  setShowMenu(null);
                                }}
                                className="text-xs text-gray-200 hover:text-white px-2 py-1 hover:bg-white/10 rounded transition-colors"
                              >
                                {language === 'ko' ? '신고' : 'Report'}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </motion.div>
                  );
                })}
                </div>
              </div>

              {/* Selected Match Detail */}
              <div className="lg:col-span-3 lg:mt-[3rem]">
                {selectedMatch ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-emerald-900/60 to-teal-900/50 backdrop-blur-lg rounded-2xl p-6 border border-emerald-200/40 sticky top-4 shadow-2xl"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 drop-shadow-2xl">
                      {language === 'ko' ? '케미스트리 분석' : 'Chemistry Analysis'}
                    </h3>
                    
                    {(() => {
                      const chemistry = getChemistryInfo(userPersonalityType, selectedMatch.personalityType);
                      const matchAnimal = getAnimalByType(selectedMatch.personalityType);
                      const matchIndex = compatibleUsers.findIndex(u => u.id === selectedMatch.id);
                      
                      return (
                        <>
                          <div className="text-center mb-4">
                            <div className="flex justify-center items-center gap-4 mb-4">
                              <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mb-1">
                                  {userAnimal?.emoji}
                                </div>
                                <p className="text-sm text-white font-medium drop-shadow-lg">{language === 'ko' ? '나' : 'You'}</p>
                              </div>
                              <div className="text-3xl">💫</div>
                              <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-2xl mb-1 overflow-hidden">
                                  {selectedMatch.avatar && selectedMatch.avatar.startsWith('/') ? (
                                    <img src={selectedMatch.avatar} alt={selectedMatch.nickname} className="w-full h-full object-cover" />
                                  ) : (
                                    selectedMatch.avatar || matchAnimal?.emoji || '🎨'
                                  )}
                                </div>
                                <p className="text-sm text-white font-medium drop-shadow-lg">{selectedMatch.nickname}</p>
                              </div>
                            </div>
                            
                            <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-base font-bold drop-shadow-xl ${
                              matchIndex < 2 ? 'bg-green-500/20 text-green-300' :
                              matchIndex === 2 ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              <Heart className="w-4 h-4" />
                              {selectedMatch.compatibilityScore}% {language === 'ko' ? '케미스트리' : 'Chemistry'}
                            </div>
                          </div>

                          {chemistry ? (
                            <>
                              <div className="mb-4 border-l-4 border-emerald-400 bg-black/25 backdrop-blur-sm rounded-r-lg pl-4 py-3">
                                <h4 className="text-lg font-bold text-emerald-100 mb-2 drop-shadow-lg flex items-center gap-2">
                                  <span className="text-emerald-300">🌿</span>
                                  {language === 'ko' ? '시너지' : 'Synergy'}
                                </h4>
                                <p className="text-base text-gray-100 mb-3 drop-shadow-lg leading-relaxed">
                                  {(() => {
                                    const synergyDesc = language === 'ko' ? chemistry.synergy.description_ko : chemistry.synergy.description;
                                    // Replace animal names with actual usernames
                                    const userDisplayName = user?.nickname || user?.name || 'You';
                                    const matchDisplayName = selectedMatch.nickname || 'Partner';
                                    
                                    // Get animal names for both users
                                    const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                    const matchAnimalName = language === 'ko' ? matchAnimal?.animal_ko : matchAnimal?.animal;
                                    
                                    // Replace animal names with "Username(Animal)" format
                                    let updatedDesc = synergyDesc;
                                    if (userAnimalName && matchAnimalName) {
                                      // Handle Korean - expanded to cover more particles
                                      if (language === 'ko') {
                                        updatedDesc = updatedDesc
                                          .replace(new RegExp(`${userAnimalName}의`, 'g'), `${userDisplayName}(${userAnimalName})의`)
                                          .replace(new RegExp(`${matchAnimalName}의`, 'g'), `${matchDisplayName}(${matchAnimalName})의`)
                                          .replace(new RegExp(`${userAnimalName}가`, 'g'), `${userDisplayName}(${userAnimalName})가`)
                                          .replace(new RegExp(`${matchAnimalName}가`, 'g'), `${matchDisplayName}(${matchAnimalName})가`)
                                          .replace(new RegExp(`${userAnimalName}는`, 'g'), `${userDisplayName}(${userAnimalName})는`)
                                          .replace(new RegExp(`${matchAnimalName}는`, 'g'), `${matchDisplayName}(${matchAnimalName})는`)
                                          .replace(new RegExp(`${userAnimalName}은`, 'g'), `${userDisplayName}(${userAnimalName})은`)
                                          .replace(new RegExp(`${matchAnimalName}은`, 'g'), `${matchDisplayName}(${matchAnimalName})은`)
                                          .replace(new RegExp(`${userAnimalName}를`, 'g'), `${userDisplayName}(${userAnimalName})를`)
                                          .replace(new RegExp(`${matchAnimalName}를`, 'g'), `${matchDisplayName}(${matchAnimalName})를`);
                                      } else {
                                        // Handle English - simplified for better matching
                                        if (userAnimalName) {
                                          updatedDesc = updatedDesc.replace(new RegExp(`\\b${userAnimalName}\\b`, 'gi'), userDisplayName);
                                        }
                                        if (matchAnimalName) {
                                          updatedDesc = updatedDesc.replace(new RegExp(`\\b${matchAnimalName}\\b`, 'gi'), matchDisplayName);
                                        }
                                      }
                                    }
                                    return updatedDesc;
                                  })()}
                                </p>
                                
                                {/* 추가 분석 내용 */}
                                <div className="space-y-1 mt-2">
                                  <div className="bg-white/8 rounded-lg p-3">
                                    <h5 className="text-base font-bold text-purple-200 mb-1 drop-shadow-lg">
                                      {language === 'ko' ? '👁️ 작품 감상 스타일' : '👁️ Art Viewing Style'}
                                    </h5>
                                    <p className="text-sm text-gray-100 leading-relaxed drop-shadow-md">
                                      {(() => {
                                        const synergyKey = getSynergyKey(userPersonalityType, selectedMatch.personalityType);
                                        const synergy = synergyTable[synergyKey];
                                        
                                        if (synergy) {
                                          const viewingStyleText = language === 'ko' ? synergy.viewingStyle.ko : synergy.viewingStyle.en;
                                          const userDisplayName = user?.nickname || user?.name || 'You';
                                          const matchDisplayName = selectedMatch.nickname || 'Partner';
                                          const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                          const matchAnimalName = language === 'ko' ? matchAnimal?.animal_ko : matchAnimal?.animal;
                                          
                                          // Replace animal names with "Username(Animal)" format in synergy text
                                          let updatedText = viewingStyleText;
                                          if (userAnimalName && matchAnimalName) {
                                            if (language === 'ko') {
                                              // Replace various Korean patterns - expanded with more particles
                                              updatedText = updatedText
                                                .replace(new RegExp(`${userAnimalName}(의|은|는|가|와|이|를|에게|도|만)`, 'g'), `${userDisplayName}(${userAnimalName})$1`)
                                                .replace(new RegExp(`${matchAnimalName}(의|은|는|가|와|이|를|에게|도|만)`, 'g'), `${matchDisplayName}(${matchAnimalName})$1`);
                                            } else {
                                              // Replace English patterns - simplified
                                              if (userAnimalName) {
                                                updatedText = updatedText.replace(new RegExp(`\\b${userAnimalName}\\b`, 'gi'), userDisplayName);
                                              }
                                              if (matchAnimalName) {
                                                updatedText = updatedText.replace(new RegExp(`\\b${matchAnimalName}\\b`, 'gi'), matchDisplayName);
                                              }
                                            }
                                          }
                                          return updatedText;
                                        }
                                        
                                        // 폴백: 테이블에 없는 경우 기본 메시지
                                        const userDisplayName = user?.nickname || user?.name || 'You';
                                        const matchDisplayName = selectedMatch.nickname || 'Partner';
                                        return language === 'ko' 
                                          ? `${userDisplayName}(${userAnimal?.animal_ko})와 ${matchDisplayName}(${matchAnimal?.animal_ko})의 독특한 관람 스타일이 서로를 보완해요!`
                                          : `${userDisplayName}(${userAnimal?.animal}) and ${matchDisplayName}(${matchAnimal?.animal}) have unique viewing styles that complement each other!`;
                                      })()}
                                    </p>
                                  </div>
                                  
                                  <div className="bg-white/8 rounded-lg p-3">
                                    <h5 className="text-base font-bold text-blue-200 mb-1 drop-shadow-lg">
                                      {language === 'ko' ? '💬 대화 케미스트리' : '💬 Conversation Chemistry'}
                                    </h5>
                                    <p className="text-sm text-gray-100 leading-relaxed drop-shadow-md">
                                      {(() => {
                                        const synergyKey = getSynergyKey(userPersonalityType, selectedMatch.personalityType);
                                        const synergy = synergyTable[synergyKey];
                                        
                                        if (synergy) {
                                          const conversationText = language === 'ko' ? synergy.conversationChemistry.ko : synergy.conversationChemistry.en;
                                          const userDisplayName = user?.nickname || user?.name || 'You';
                                          const matchDisplayName = selectedMatch.nickname || 'Partner';
                                          const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                          const matchAnimalName = language === 'ko' ? matchAnimal?.animal_ko : matchAnimal?.animal;
                                          
                                          // Replace animal names with "Username(Animal)" format in synergy text
                                          let updatedText = conversationText;
                                          if (userAnimalName && matchAnimalName) {
                                            if (language === 'ko') {
                                              // Replace various Korean patterns - expanded with more particles
                                              updatedText = updatedText
                                                .replace(new RegExp(`${userAnimalName}(의|은|는|가|와|이|를|에게|도|만)`, 'g'), `${userDisplayName}(${userAnimalName})$1`)
                                                .replace(new RegExp(`${matchAnimalName}(의|은|는|가|와|이|를|에게|도|만)`, 'g'), `${matchDisplayName}(${matchAnimalName})$1`);
                                            } else {
                                              // Replace English patterns - simplified
                                              if (userAnimalName) {
                                                updatedText = updatedText.replace(new RegExp(`\\b${userAnimalName}\\b`, 'gi'), userDisplayName);
                                              }
                                              if (matchAnimalName) {
                                                updatedText = updatedText.replace(new RegExp(`\\b${matchAnimalName}\\b`, 'gi'), matchDisplayName);
                                              }
                                            }
                                          }
                                          return updatedText;
                                        }
                                        
                                        // 폴백: 테이블에 없는 경우 기본 메시지
                                        const userDisplayName = user?.nickname || user?.name || 'You';
                                        const matchDisplayName = selectedMatch.nickname || 'Partner';
                                        return language === 'ko' 
                                          ? `${userDisplayName}(${userAnimal?.animal_ko})와 ${matchDisplayName}(${matchAnimal?.animal_ko})의 대화는 서로를 풍요롭게 만들어요!`
                                          : `${userDisplayName}(${userAnimal?.animal}) and ${matchDisplayName}(${matchAnimal?.animal}) have enriching conversations!`;
                                      })()}
                                    </p>
                                  </div>
                                  
                                  <div className="bg-white/8 rounded-lg p-3">
                                    <h5 className="text-base font-bold text-green-200 mb-1 drop-shadow-lg">
                                      {language === 'ko' ? '🎯 추천 활동' : '🎯 Recommended Activities'}
                                    </h5>
                                    <p className="text-sm text-gray-100 leading-relaxed drop-shadow-md">
                                      {(() => {
                                        const synergyKey = getSynergyKey(userPersonalityType, selectedMatch.personalityType);
                                        const synergy = synergyTable[synergyKey];
                                        
                                        if (synergy) {
                                          const activitiesText = language === 'ko' ? synergy.recommendedActivities.ko : synergy.recommendedActivities.en;
                                          const userDisplayName = user?.nickname || user?.name || 'You';
                                          const matchDisplayName = selectedMatch.nickname || 'Partner';
                                          const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                          const matchAnimalName = language === 'ko' ? matchAnimal?.animal_ko : matchAnimal?.animal;
                                          
                                          // Replace animal names with "Username(Animal)" format in synergy text
                                          let updatedText = activitiesText;
                                          if (userAnimalName && matchAnimalName) {
                                            if (language === 'ko') {
                                              // Replace various Korean patterns - expanded with more particles
                                              updatedText = updatedText
                                                .replace(new RegExp(`${userAnimalName}(의|은|는|가|와|이|를|에게|도|만)`, 'g'), `${userDisplayName}(${userAnimalName})$1`)
                                                .replace(new RegExp(`${matchAnimalName}(의|은|는|가|와|이|를|에게|도|만)`, 'g'), `${matchDisplayName}(${matchAnimalName})$1`);
                                            } else {
                                              // Replace English patterns - simplified
                                              if (userAnimalName) {
                                                updatedText = updatedText.replace(new RegExp(`\\b${userAnimalName}\\b`, 'gi'), userDisplayName);
                                              }
                                              if (matchAnimalName) {
                                                updatedText = updatedText.replace(new RegExp(`\\b${matchAnimalName}\\b`, 'gi'), matchDisplayName);
                                              }
                                            }
                                          }
                                          return updatedText;
                                        }
                                        
                                        // 폴백: 테이블에 없는 경우 기본 메시지
                                        return language === 'ko' 
                                          ? `전시 후 카페에서 감상 나누기, 함께 전시 리뷰 작성하기, 다음 전시 계획 세우기`
                                          : `Share impressions at cafe, write exhibition reviews together, plan next visits`;
                                      })()}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-4 border-l-4 border-cyan-400 bg-black/25 backdrop-blur-sm rounded-r-lg pl-4 py-3">
                                <h4 className="text-lg font-bold text-cyan-100 mb-2 drop-shadow-lg flex items-center gap-2">
                                  <span className="text-cyan-300">🎨</span>
                                  {language === 'ko' ? '추천 전시' : 'Recommended Exhibitions'}
                                </h4>
                                <div className="space-y-1">
                                  {(language === 'ko' ? chemistry.recommendedExhibitions_ko : chemistry.recommendedExhibitions).slice(0, 3).map((exhibition, idx) => {
                                    const exhibitionReasons = [
                                      {
                                        ko: "두 분의 감상 스타일이 서로를 보완하며 작품의 새로운 면을 발견할 수 있어요",
                                        en: "Your viewing styles complement each other, revealing new aspects of artworks"
                                      },
                                      {
                                        ko: "대화를 나누며 작품을 감상하기 좋은 공간 구성과 동선을 갖추고 있어요",
                                        en: "The space layout encourages conversation while viewing"
                                      },
                                      {
                                        ko: "두 분이 모두 관심있어 하는 테마와 작가의 작품들이 전시되어 있어요",
                                        en: "Features themes and artists that interest both of you"
                                      }
                                    ];
                                    
                                    return (
                                      <div key={idx} className="bg-white/8 rounded-lg p-2">
                                        <div className="flex items-start gap-2">
                                          <Palette className="w-4 h-4 text-purple-400 mt-0.5" />
                                          <div className="flex-1">
                                            <p className="text-base text-gray-100 font-semibold drop-shadow-lg">
                                              {exhibition}
                                            </p>
                                            <p className="text-sm text-gray-100 italic drop-shadow-md leading-tight">
                                              {language === 'ko' ? exhibitionReasons[idx].ko : exhibitionReasons[idx].en}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* 실제 전시 하이라이트 */}
                                <div className="mt-3 pr-2">
                                  <div className="bg-gradient-to-r from-cyan-900/20 to-teal-900/20 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30">
                                    <div className="flex gap-3">
                                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                        <OptimizedImage
                                          src="/images/backgrounds/contemporary-gallery-motion-blur-minimal.jpg"
                                          alt="Exhibition"
                                          width={80}
                                          height={80}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="text-sm font-bold text-cyan-100 mb-1 drop-shadow-lg">
                                          {language === 'ko' ? '데이비드 호크니: 빛의 풍경' : 'David Hockney: Landscapes of Light'}
                                        </h5>
                                        <p className="text-xs text-gray-300 mb-1">
                                          {language === 'ko' ? '서울시립미술관' : 'Seoul Museum of Art'} · {language === 'ko' ? '~2월 28일' : '~Feb 28'}
                                        </p>
                                        <p className="text-xs text-cyan-200 italic drop-shadow-sm">
                                          💫 {language === 'ko' 
                                            ? `${user?.nickname || user?.name || 'You'}(${userAnimal?.animal_ko})과 ${selectedMatch.nickname}(${matchAnimal?.animal_ko})의 관점이 만나면 색채의 새로운 차원을 발견해요`
                                            : `When ${user?.nickname || user?.name || 'You'}(${userAnimal?.animal}) meets ${selectedMatch.nickname}(${matchAnimal?.animal}), discover new dimensions of color`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <button 
                                    onClick={() => router.push('/exhibitions')}
                                    className="w-full mt-2 bg-gradient-to-r from-cyan-600/80 to-teal-600/80 hover:from-cyan-600 hover:to-teal-600 text-white rounded-lg py-2 text-xs font-semibold transition-all drop-shadow-lg flex items-center justify-center gap-1"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    {language === 'ko' ? '맞춤 전시 더보기' : 'More Exhibitions'}
                                  </button>
                                </div>
                              </div>

                              <div className="bg-teal-600/30 backdrop-blur-sm rounded-lg p-4 mt-3">
                                <div className="flex items-start gap-2">
                                  <Info className="w-4 h-4 text-teal-300 mt-0.5" />
                                  <div className="text-sm">
                                    <p className="text-teal-200 font-bold mb-2 text-base drop-shadow-lg">
                                      {language === 'ko' ? '함께 관람할 때 팁' : 'Tips for Viewing Together'}
                                    </p>
                                    <div className="space-y-2">
                                      <p className="text-gray-100 text-sm drop-shadow-md leading-relaxed">
                                        {(() => {
                                          const tipText = language === 'ko' ? chemistry.tips.for_type1_ko : chemistry.tips.for_type1;
                                          const userDisplayName = user?.nickname || user?.name || 'You';
                                          const matchDisplayName = selectedMatch.nickname || 'Partner';
                                          
                                          // Get animal names for both users
                                          const userAnimalName = language === 'ko' ? userAnimal?.animal_ko : userAnimal?.animal;
                                          const matchAnimalName = language === 'ko' ? matchAnimal?.animal_ko : matchAnimal?.animal;
                                          
                                          // Replace animal names with "Username(Animal)" format
                                          let updatedTip = tipText;
                                          if (userAnimalName && matchAnimalName) {
                                            // Handle Korean
                                            if (language === 'ko') {
                                              updatedTip = updatedTip
                                                .replace(new RegExp(`${userAnimalName}가`, 'g'), `${userDisplayName}(${userAnimalName})가`)
                                                .replace(new RegExp(`${matchAnimalName}가`, 'g'), `${matchDisplayName}(${matchAnimalName})가`)
                                                .replace(new RegExp(`${userAnimalName}에게`, 'g'), `${userDisplayName}(${userAnimalName})에게`)
                                                .replace(new RegExp(`${matchAnimalName}에게`, 'g'), `${matchDisplayName}(${matchAnimalName})에게`)
                                                .replace(new RegExp(`\\b${userAnimalName}\\b`, 'g'), `${userDisplayName}(${userAnimalName})`)
                                                .replace(new RegExp(`\\b${matchAnimalName}\\b`, 'g'), `${matchDisplayName}(${matchAnimalName})`);
                                            } else {
                                              // Handle English - simplified for better matching
                                              if (userAnimalName) {
                                                updatedTip = updatedTip.replace(new RegExp(`\\b${userAnimalName}\\b`, 'gi'), userDisplayName);
                                              }
                                              if (matchAnimalName) {
                                                updatedTip = updatedTip.replace(new RegExp(`\\b${matchAnimalName}\\b`, 'gi'), matchDisplayName);
                                              }
                                            }
                                          }
                                          return updatedTip;
                                        })()}
                                      </p>
                                      <ul className="text-sm text-gray-100 space-y-1 list-disc list-inside drop-shadow-md">
                                        <li>{language === 'ko' ? '첫 만남은 전시장 입구 카페에서 가볍게 인사를 나눠보세요' : 'Start with a casual greeting at the entrance cafe'}</li>
                                        <li>{language === 'ko' ? '각자 좋아하는 작품 3개씩 골라서 서로에게 소개해보세요' : 'Each pick 3 favorite pieces to share with each other'}</li>
                                        <li>{language === 'ko' ? '작품 앞에서 너무 오래 머물지 말고 리듬있게 관람하세요' : 'Keep a comfortable viewing rhythm, not lingering too long'}</li>
                                        <li>{language === 'ko' ? '관람 후 근처 카페에서 감상을 나누는 시간을 가져보세요' : 'Plan time afterwards to discuss impressions at a nearby cafe'}</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : null}

                          <button 
                            onClick={() => alert(language === 'ko' ? '메시지 기능은 곧 오픈 예정입니다! 🚀' : 'Messaging feature coming soon! 🚀')}
                            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-colors"
                          >
                            {language === 'ko' ? '메시지 보내기' : 'Send Message'}
                          </button>
                        </>
                      );
                    })()}
                  </motion.div>
                ) : (
                  <div className="bg-black/25 backdrop-blur-sm rounded-2xl p-6 border border-white/30 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-purple-300">
                      {language === 'ko' 
                        ? '동행자를 선택하여 자세한 케미스트리를 확인하세요'
                        : 'Select a companion to see detailed chemistry'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'exhibitions' && (
            <motion.div
              key="exhibitions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {language === 'ko' ? '함께 가면 좋은 전시' : 'Exhibitions to Visit Together'}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {exhibitionMatches.map((exhibition) => (
                  <motion.div
                    key={exhibition.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/60 backdrop-blur-md rounded-2xl overflow-hidden border border-white/40 hover:bg-black/70 hover:border-white/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="relative h-48">
                      <OptimizedImage
                        src={exhibition.image}
                        alt={exhibition.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-lg font-semibold text-white mb-1">{exhibition.title}</h4>
                        <p className="text-sm text-gray-300">{exhibition.museum}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <MapPin className="w-4 h-4" />
                          {language === 'ko' ? `${exhibition.endDate}까지` : `Until ${exhibition.endDate}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-purple-300">
                          <Users className="w-4 h-4" />
                          {language === 'ko' ? `${exhibition.matchingUsers}명 관심` : `${exhibition.matchingUsers} interested`}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          alert(language === 'ko' ? '동행자 찾기 기능은 추후 구현 예정입니다!' : 'Find Companions feature coming soon!');
                        }}
                        className="w-full bg-purple-600/40 hover:bg-purple-600/60 text-purple-300 rounded-lg py-2 font-medium transition-colors"
                      >
                        {language === 'ko' ? '동행자 찾기' : 'Find Companions'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'forums' && (
            <motion.div
              key="forums"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {language === 'ko' ? '토론 포럼' : 'Discussion Forums'}
                  </h2>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    {language === 'ko' ? '주제 만들기' : 'Create Topic'}
                  </button>
                </div>
                
                <ForumList />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/30 shadow-2xl"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {language === 'ko' ? '신고하기' : 'Report User'}
              </h3>
              
              <p className="text-gray-300 mb-4">
                {language === 'ko' 
                  ? '신고 사유를 선택해주세요:' 
                  : 'Please select a reason for reporting:'}
              </p>
              
              <div className="space-y-2 mb-6">
                {[
                  { id: 'spam', label: language === 'ko' ? '허위 프로필/스팸' : 'Fake profile/Spam' },
                  { id: 'inappropriate', label: language === 'ko' ? '부적절한 콘텐츠' : 'Inappropriate content' },
                  { id: 'harassment', label: language === 'ko' ? '욕설/성희롱' : 'Harassment/Abuse' },
                  { id: 'scam', label: language === 'ko' ? '사기/금전 요구' : 'Scam/Fraud' },
                  { id: 'other', label: language === 'ko' ? '기타' : 'Other' }
                ].map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => {
                      handleReport(showReportModal, reason.id);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-transparent hover:border-white/20 text-gray-200"
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowReportModal(null)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/20 text-gray-300"
              >
                {language === 'ko' ? '취소' : 'Cancel'}
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'community',
          activeTab: activeTab,
          personalityType: userPersonalityType
        }}
      />
    </div>
  );

  // Return both components with CSS-based hiding
  return (
    <>
      <div className="block lg:hidden">
        <MobileCommunity />
      </div>
      <div className="hidden lg:block">
        {desktopComponent}
      </div>
    </>
  );
}