import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/PageTransition';
import { RoomsView } from '@/features/rooms/RoomsView';

export const metadata: Metadata = { title: 'Cômodos · Faxyna' };

export default function Page() {
  return (
    <PageTransition>
      <RoomsView />
    </PageTransition>
  );
}
