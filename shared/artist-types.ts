// 🎨 SAYU Artist Types - 저작권 안전 구조

export type CopyrightStatus = 'public_domain' | 'licensed' | 'contemporary' | 'verified_artist';

export interface BaseArtist {
  id: string;
  name: string;
  nameKo?: string;
  birthYear?: number;
  deathYear?: number;
  nationality: string;
  nationalityKo?: string;
  bio: string;
  bioKo?: string;
  copyrightStatus: CopyrightStatus;
  followCount: number;
  isFollowing?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicDomainArtist extends BaseArtist {
  copyrightStatus: 'public_domain';
  images: {
    portrait?: string; // 작가 사진 (퍼블릭 도메인)
    works: PublicDomainWork[];
  };
  sources: {
    wikidata?: string;
    metMuseum?: string;
    rijksmuseum?: string;
    wikimedia?: string;
  };
}

export interface LicensedArtist extends BaseArtist {
  copyrightStatus: 'licensed';
  licenseInfo: {
    licenseType: string;
    licenseHolder: string;
    licensedUntil?: Date;
    usageRights: string[];
  };
  images: {
    portrait?: string; // 라이선스된 이미지
    thumbnails: LicensedWork[]; // 저해상도 썸네일만
  };
  purchaseLinks?: {
    gallery?: string;
    website?: string;
    marketplace?: string;
  };
}

export interface ContemporaryArtist extends BaseArtist {
  copyrightStatus: 'contemporary';
  // 이미지 없음 - 링크와 메타데이터만
  officialLinks: {
    instagram?: string;
    website?: string;
    gallery?: string;
    twitter?: string;
    facebook?: string;
  };
  representation?: {
    gallery: string;
    gallerySite?: string;
    agent?: string;
  };
  recentExhibitions: {
    title: string;
    venue: string;
    year: number;
    city: string;
    link?: string;
  }[];
  mediaLinks: {
    interviews: MediaLink[];
    articles: MediaLink[];
    reviews: MediaLink[];
  };
}

export interface VerifiedArtist extends BaseArtist {
  copyrightStatus: 'verified_artist';
  // 작가가 직접 관리하는 인증 계정
  isVerified: true;
  verificationDate: Date;
  verificationMethod: 'email' | 'gallery' | 'institution';
  artistManaged: {
    profileImage?: string; // 작가 업로드
    allowedWorks: VerifiedWork[]; // 작가 허용 작품만
    customBio?: string;
    socialLinks: Record<string, string>;
  };
  permissions: {
    canShareImages: boolean;
    allowCommercialUse: boolean;
    allowDerivativeWorks: boolean;
    customLicense?: string;
  };
}

export type Artist = PublicDomainArtist | LicensedArtist | ContemporaryArtist | VerifiedArtist;

// Work types
export interface BaseWork {
  id: string;
  title: string;
  titleKo?: string;
  year?: number;
  medium: string;
  mediumKo?: string;
  dimensions?: string;
  description?: string;
  descriptionKo?: string;
  artistId: string;
}

export interface PublicDomainWork extends BaseWork {
  images: {
    thumbnail: string;
    medium: string;
    large: string;
    source: string; // 출처 명시
  };
  metadata: {
    museum?: string;
    accessionNumber?: string;
    creditLine?: string;
    rights: 'Public Domain' | 'CC0' | 'CC BY';
  };
  downloadable: true;
}

export interface LicensedWork extends BaseWork {
  images: {
    thumbnail: string; // 워터마크 있는 저해상도만
    watermarked: string;
  };
  licenseInfo: {
    holder: string;
    restrictions: string[];
    purchaseLink?: string;
  };
  downloadable: false;
}

export interface VerifiedWork extends BaseWork {
  images?: {
    original?: string; // 작가 업로드
    thumbnail?: string;
  };
  uploadedBy: 'artist' | 'gallery' | 'representative';
  uploadDate: Date;
  visibility: 'public' | 'followers' | 'private';
  price?: {
    amount: number;
    currency: string;
    isForSale: boolean;
  };
  allowSharing: boolean;
}

export interface MediaLink {
  title: string;
  url: string;
  date: Date;
  source: string;
  language: 'ko' | 'en' | 'other';
}

// Helper type guards
export function isPublicDomainArtist(artist: Artist): artist is PublicDomainArtist {
  return artist.copyrightStatus === 'public_domain';
}

export function isLicensedArtist(artist: Artist): artist is LicensedArtist {
  return artist.copyrightStatus === 'licensed';
}

export function isContemporaryArtist(artist: Artist): artist is ContemporaryArtist {
  return artist.copyrightStatus === 'contemporary';
}

export function isVerifiedArtist(artist: Artist): artist is VerifiedArtist {
  return artist.copyrightStatus === 'verified_artist';
}

// Simplified Artist type for backward compatibility
export interface SimpleArtist {
  id: string;
  name: string;
  nameKo?: string;
  bio?: string;
  bioKo?: string;
  birthYear?: number;
  deathYear?: number;
  nationality?: string;
  nationalityKo?: string;
  artMovements?: string[];
  notableWorks?: string[];
  imageUrl?: string;
  images?: string[] | { portrait?: string; works?: any[] };
  followCount?: number;
  copyrightStatus?: CopyrightStatus;
  isFollowing?: boolean;
  artistManaged?: boolean | any;
  palette?: string[];
}

// Artist color palette
export interface ArtistColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  palette?: string[];
}