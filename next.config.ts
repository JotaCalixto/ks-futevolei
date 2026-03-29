// next.config.ts
import type { NextConfig } from 'next'
const withPWA = require('next-pwa')

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.onesignal.com https://onesignal.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://onesignal.com https://fcm.googleapis.com",
              "worker-src 'self' blob:",
              "manifest-src 'self'",
            ].join('; '),
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Content-Type', value: 'application/manifest+json' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/splash',
        permanent: false,
      },
    ]
  },

  turbopack: {},

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'supabase-storage-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 2592000 },
      },
    },
    {
      urlPattern: /\/_next\/image\?.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: /\/icons\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'icons-cache',
        expiration: { maxEntries: 20, maxAgeSeconds: 2592000 },
      },
    },
    {
      urlPattern: /\/sounds\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sounds-cache',
        expiration: { maxEntries: 10, maxAgeSeconds: 2592000 },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
})

export default pwaConfig(nextConfig)