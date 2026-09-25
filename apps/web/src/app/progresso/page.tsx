import type { Metadata } from 'next';
import { ProgressView } from '@/features/progress/ProgressView';

export const metadata: Metadata = { title: 'Progresso · Faxyna' };

export default function Page() {
  return <ProgressView />;
}
