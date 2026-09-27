import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/PageTransition';
import { ProgressView } from '@/features/progress/ProgressView';

export const metadata: Metadata = { title: 'Progresso · Faxyna' };

export default function Page() {
  return (
    <PageTransition>
      <ProgressView />
    </PageTransition>
  );
}
