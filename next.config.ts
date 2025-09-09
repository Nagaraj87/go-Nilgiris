
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  },
   webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude bcrypt from the client-side bundle
      config.externals.push('bcrypt');
    }
    return config;
  },
};

export default nextConfig;
