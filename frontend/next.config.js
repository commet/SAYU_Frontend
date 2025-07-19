/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three'],
  images: {
    domains: ['res.cloudinary.com', 'images.metmuseum.org', 'openaccess-cdn.clevelandart.org', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig