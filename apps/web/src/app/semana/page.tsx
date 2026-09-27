import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/PageTransition';
import { WeekView } from '@/features/week/WeekView';

export const metadata: Metadata = { title: 'Semana · Faxyna' };

export default function Page() {
  return (
    <PageTransition>
      <WeekView />
    </PageTransition>
  );
}
