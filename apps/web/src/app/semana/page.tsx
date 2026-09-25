import type { Metadata } from 'next';
import { WeekView } from '@/features/week/WeekView';

export const metadata: Metadata = { title: 'Semana · Faxyna' };

export default function Page() {
  return <WeekView />;
}
