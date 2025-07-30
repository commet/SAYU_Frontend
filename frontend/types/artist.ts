// Artist types from shared package
// Since @sayu/shared is not available, we'll need to define these types locally
// TODO: Import from @sayu/shared/artist-types when package is available

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

export interface PublicDomainWork {
  id: string;
  title: string;
  year?: number;
  medium?: string;
  imageUrl: string;
  source: string;
}

export interface LicensedWork {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export interface PublicDomainArtist extends BaseArtist {
  copyrightStatus: 'public_domain';
  images: {
    portrait?: string;
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
    portrait?: string;
    thumbnails: LicensedWork[];
  };
  purchaseLinks?: {
    gallery?: string;
    website?: string;
  };
}

export type Artist = PublicDomainArtist | LicensedArtist;