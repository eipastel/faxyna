import type { NextConfig } from 'next';

// Everything runs in the browser (data via the gateway), so the site is exported as static.
const nextConfig: NextConfig = {
  output: 'export',
};

export default nextConfig;
