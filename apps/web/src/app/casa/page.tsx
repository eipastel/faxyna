import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/PageTransition';
import { HouseView } from '@/features/house/HouseView';

export const metadata: Metadata = { title: 'Casa · Faxyna' };

export default function Page() {
  return (
    <PageTransition>
      <HouseView />
    </PageTransition>
  );
}
