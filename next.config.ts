import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        // Your specific Supabase project ID
        hostname: 'uncunljruxfhqpzpmigr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      /* --- ADDED FOR SOCIAL LOGINS & SETTINGS PAGE --- */
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google Profile Pictures
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub Profile Pictures
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;