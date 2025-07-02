'use client';

import Link from 'next/link';
import { Shield, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-white">SAYU</span>
            <Heart className="w-5 h-5 text-purple-400" />
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              href="/copyright-policy" 
              className="flex items-center text-gray-400 hover:text-purple-400 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              {language === 'ko' ? '저작권 정책' : 'Copyright Policy'}
            </Link>
            <Link 
              href="/artists" 
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              {language === 'ko' ? '작가들' : 'Artists'}
            </Link>
            <a 
              href="mailto:copyright@sayu.art" 
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              {language === 'ko' ? '문의' : 'Contact'}
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-500">
            © 2024 SAYU. {language === 'ko' ? '모든 권리 보유.' : 'All rights reserved.'}
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          <p>
            {language === 'ko' 
              ? 'SAYU는 모든 예술 작품의 저작권을 존중하며, 공정한 사용과 교육적 목적으로만 콘텐츠를 공유합니다.'
              : 'SAYU respects all artwork copyrights and shares content only for fair use and educational purposes.'
            }
          </p>
        </div>
      </div>
    </footer>
  );
}