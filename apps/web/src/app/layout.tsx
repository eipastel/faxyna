import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AppShell } from '@/components/layout/AppShell';
import { Splash } from '@/components/layout/Splash';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' });

const description = 'Cronograma de limpeza da casa: o que fazer hoje, o que está atrasado e quem cuida de cada tarefa.';

// Icons, OG image and manifest come from the file conventions in this folder.
// ponytail: no metadataBase; on Vercel Next falls back to VERCEL_PROJECT_PRODUCTION_URL. Set it once there's a custom domain.
export const metadata: Metadata = {
  title: 'Faxyna',
  description,
  applicationName: 'Faxyna',
  appleWebApp: { capable: true, title: 'Faxyna', statusBarStyle: 'default' },
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'Faxyna', title: 'Faxyna', description },
  twitter: { card: 'summary_large_image', title: 'Faxyna', description },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Lets env(safe-area-inset-*) report the home indicator area on iOS.
  viewportFit: 'cover',
  themeColor: '#f5f6f8',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Material Symbols icons (FILL axis 0..1 for active tabs). */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=block"
        />
      </head>
      <body>
        <Splash />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
