import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Faxyna',
    short_name: 'Faxyna',
    description: 'Cronograma de limpeza da casa.',
    lang: 'pt-BR',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f6f8',
    theme_color: '#f5f6f8',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
