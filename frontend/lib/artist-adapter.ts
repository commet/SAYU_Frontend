import { PublicDomainArtist, LicensedArtist, ContemporaryArtist, VerifiedArtist } from '@/types/artist';

type Artist = PublicDomainArtist | LicensedArtist | ContemporaryArtist | VerifiedArtist;

export interface BackendArtist {
  id: string;
  name: string;
  name_ko: string;
  birth_year: number | null;
  death_year: number | null;
  nationality: string | null;
  nationality_ko: string | null;
  bio: string | null;
  bio_ko: string | null;
  copyright_status: string;
  follow_count: number;
  is_featured: boolean;
  era: string | null;
  images: any;
  sources?: string[];
}

export function adaptArtistFromBackend(backendArtist: BackendArtist): Artist {
  const baseArtist = {
    id: backendArtist.id,
    name: {
      en: backendArtist.name,
      ko: backendArtist.name_ko || backendArtist.name
    },
    nationality: backendArtist.nationality || 'Unknown',
    birthYear: backendArtist.birth_year || undefined,
    deathYear: backendArtist.death_year || undefined,
    bio: {
      en: backendArtist.bio || `Artist from ${backendArtist.sources?.[0] || 'various'} collections`,
      ko: backendArtist.bio_ko || `${backendArtist.sources?.[0] || '다양한'} 컬렉션 작가`
    },
    images: backendArtist.images || {},
    workCount: Math.floor(Math.random() * 500) + 50, // Temporary until we have real work counts
    followCount: backendArtist.follow_count || 0
  };

  switch (backendArtist.copyright_status) {
    case 'public_domain':
      return {
        ...baseArtist,
        copyrightStatus: 'public_domain',
        sources: {
          wikidata: backendArtist.sources?.includes('wikidata') ? backendArtist.id : undefined,
          wikimedia: backendArtist.sources?.includes('wikimedia') ? backendArtist.id : undefined
        }
      } as PublicDomainArtist;

    case 'licensed':
      return {
        ...baseArtist,
        copyrightStatus: 'licensed',
        licenseInfo: {
          holder: `${backendArtist.name} Estate`,
          contact: 'licensing@example.com',
          type: 'Estate License',
          usageRights: ['Educational Use', 'Museum Display']
        }
      } as LicensedArtist;

    case 'contemporary':
      return {
        ...baseArtist,
        copyrightStatus: 'contemporary',
        representation: {
          gallery: 'Contemporary Gallery',
          website: '#'
        },
        recentExhibitions: []
      } as ContemporaryArtist;

    case 'verified_artist':
      return {
        ...baseArtist,
        copyrightStatus: 'verified_artist',
        isVerified: true,
        verificationDate: new Date().toISOString(),
        artistManaged: {
          profileImage: backendArtist.images.profile,
          allowedWorks: [],
          socialLinks: {}
        },
        permissions: {
          canShareImages: true,
          allowCommercialUse: false,
          allowDerivativeWorks: false
        }
      } as VerifiedArtist;

    default:
      // Default to contemporary for unknown status
      return {
        ...baseArtist,
        copyrightStatus: 'contemporary',
        representation: {},
        recentExhibitions: []
      } as ContemporaryArtist;
  }
}

export function adaptArtistsFromBackend(backendArtists: BackendArtist[]): Artist[] {
  return backendArtists.map(adaptArtistFromBackend);
}