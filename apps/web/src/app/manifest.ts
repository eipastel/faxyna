import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Faxyna',
    short_name: 'Faxyna',
    description: 'Cronograma de limpeza da casa.',
    lang: 'pt-BR',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f6f8',
    theme_color: '#f5f6f8',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
