import type { NextConfig } from 'next';

// Everything runs in the browser (data via the gateway), so the site is exported as static.
const nextConfig: NextConfig = {
  output: 'export',
  // Baked into the bundle and published at /version.json; a mismatch means a new deploy.
  env: { NEXT_PUBLIC_APP_VERSION: process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now()) },
};

export default nextConfig;
