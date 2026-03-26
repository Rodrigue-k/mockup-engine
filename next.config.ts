import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Indique à Next.js d'ignorer ces bibliothèques lourdes contenant des binaires
  serverExternalPackages: [
    '@remotion/renderer',
    '@remotion/bundler',
  ],
  async headers() {
    return [
      {
        source: '/assets/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
        ],
      },
      {
        source: '/temp/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
        ],
      },
    ];
  },
};

export default nextConfig;
