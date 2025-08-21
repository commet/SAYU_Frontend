/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: true,
  register: true,
  skipWaiting: true
})

const nextConfig = {
  reactStrictMode: false, // React 19 RC compatibility
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    // Force rebuild
    isrMemoryCacheSize: 0,
  },
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'picsum.photos' },
      { hostname: 'source.unsplash.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 'www.artic.edu' },
      { hostname: 'upload.wikimedia.org' },
      { hostname: 'images.metmuseum.org' },
      { hostname: 'ids.si.edu' },
      { hostname: 'media.nga.gov' },
      { hostname: 'lh3.googleusercontent.com' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'platform-lookaside.fbsbx.com' },
      { hostname: '*.kakaocdn.net' },
      { hostname: 'k.kakaocdn.net' },
      { hostname: 'collections.louvre.fr' },
      { hostname: 'cdn.leonardo.ai' },
      { hostname: 'www.moma.org' },
      { hostname: 'www.guggenheim.org' },
      { hostname: 'www.tate.org.uk' },
      { hostname: 'www.museoreinasofia.es' },
      { hostname: 'media.timeout.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'www.artsy.net' },
      { hostname: 'img.freepik.com' },
      { hostname: 'images.pexels.com' },
      { hostname: 'cdn.pixabay.com' },
      { hostname: 'www.nga.gov' },
      { hostname: 'encrypted-tbn0.gstatic.com' },
      { hostname: 'encrypted-tbn1.gstatic.com' },
      { hostname: 'encrypted-tbn2.gstatic.com' },
      { hostname: 'encrypted-tbn3.gstatic.com' },
      { hostname: 'www.clevelandart.org' },
      { hostname: 'api.artrabbit.com' },
      { hostname: 'cdn.sanity.io' },
      { hostname: 'www.rijksmuseum.nl' },
      { hostname: 'd32dm0rphc51dk.cloudfront.net' },
      { hostname: 'www.gallery.ca' },
      { hostname: 'www.hermitagemuseum.org' },
      { hostname: 'www.nationalgallery.org.uk' },
      { hostname: 'www.vam.ac.uk' },
      { hostname: 'www.britishmuseum.org' },
      { hostname: 'www.lacma.org' },
      { hostname: 'www.sfmoma.org' },
      { hostname: 'www.whitney.org' },
      { hostname: 'www.brooklynmuseum.org' },
      { hostname: 'www.philamuseum.org' },
      { hostname: 'www.mfah.org' },
      { hostname: 'www.seattleartmuseum.org' },
      { hostname: 'www.portlandartmuseum.org' },
      { hostname: 'www.denverartmuseum.org' },
      { hostname: 'www.dma.org' },
      { hostname: 'www.high.org' },
      { hostname: 'www.mia.org' },
      { hostname: 'www.aic.edu' },
      { hostname: 'www.clevelandart.org' },
      { hostname: 'www.detroitartsandculture.org' },
      { hostname: 'www.cincinnatiartmuseum.org' },
      { hostname: 'www.slam.org' },
      { hostname: 'www.kansascity.com' },
      { hostname: 'upload.wikimedia.org' },
      { hostname: 'commons.wikimedia.org' },
      { hostname: 'www.harvardartmuseums.org' },
      { hostname: 'asia.si.edu' },
      { hostname: 'americanart.si.edu' },
      { hostname: 'africaart.si.edu' },
      { hostname: 'www.cooperhewitt.org' },
      { hostname: 'www.freersackler.si.edu' },
      { hostname: 'hirshhorn.si.edu' },
      { hostname: 'www.si.edu' },
      { hostname: 'npg.si.edu' },
      { hostname: 'postalmuseum.si.edu' }
    ]
  },
  // Force cache invalidation
  generateBuildId: async () => {
    return 'build-' + Date.now()
  }
}

module.exports = withPWA(nextConfig)