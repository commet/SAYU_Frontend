import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

// Database의 profiles 테이블 타입
export type UserProfile = Database['public']['Tables']['profiles']['Row'];

// SAYU 확장 User 타입 - Supabase User와 SAYU 요구사항 통합
export interface SAYUUser extends SupabaseUser {
  // SAYU 특화 필드들 (profile에서 가져옴)
  nickname?: string;  // username을 nickname으로 매핑
  agencyLevel?: string;
  journeyStage?: string;
  hasProfile?: boolean;
  typeCode?: string;
  archetypeName?: string;
}

// AuthContext에서 사용할 완전한 타입
export interface AuthUser {
  id: string;  // User ID (same as auth.id)
  auth: SupabaseUser;  // Supabase 인증 정보
  profile: UserProfile | null;  // DB 프로필 정보
  // 편의를 위한 계산된 속성들
  nickname: string | null;
  agencyLevel: string;
  journeyStage: string;
  hasProfile: boolean;
  typeCode: string | null;
  archetypeName: string | null;
  token?: string;  // JWT token for API authentication
}