'use client';

import Link from 'next/link';
import { Shield, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { language } = useLanguage();

  return (
    <footer className="bg-sayu-dark-purple/50 border-t border-sayu-powder-blue/30 py-8 mt-auto backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-sayu-text-primary">SAYU.MY</span>
            <Heart className="w-5 h-5 text-sayu-double-bounce" />
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link 
              href="/terms" 
              className="text-sayu-text-secondary hover:text-sayu-tangerine-zest transition-colors"
            >
              {language === 'ko' ? '이용약관' : 'Terms'}
            </Link>
            <Link 
              href="/privacy" 
              className="text-sayu-text-secondary hover:text-sayu-tangerine-zest transition-colors"
            >
              {language === 'ko' ? '개인정보' : 'Privacy'}
            </Link>
            <Link 
              href="/copyright-policy" 
              className="flex items-center text-sayu-text-secondary hover:text-sayu-tangerine-zest transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              {language === 'ko' ? '저작권' : 'Copyright'}
            </Link>
            <Link 
              href="/artists" 
              className="text-sayu-text-secondary hover:text-sayu-tangerine-zest transition-colors"
            >
              {language === 'ko' ? '작가들' : 'Artists'}
            </Link>
            <a 
              href="mailto:copyright@sayu.art" 
              className="text-sayu-text-secondary hover:text-sayu-tangerine-zest transition-colors"
            >
              {language === 'ko' ? '문의' : 'Contact'}
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-sayu-text-muted">
            © 2024 SAYU.MY. {language === 'ko' ? '모든 권리 보유.' : 'All rights reserved.'}
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="mt-6 pt-4 border-t border-sayu-powder-blue/30 text-xs text-sayu-text-muted text-center">
          <p>
            {language === 'ko' 
              ? 'SAYU.MY는 모든 예술 작품의 저작권을 존중하며, 공정한 사용과 교육적 목적으로만 콘텐츠를 공유합니다.'
              : 'SAYU.MY respects all artwork copyrights and shares content only for fair use and educational purposes.'
            }
          </p>
        </div>
      </div>
    </footer>
  );
}