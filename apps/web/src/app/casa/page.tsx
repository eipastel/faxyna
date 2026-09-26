import type { Metadata } from 'next';
import { HouseView } from '@/features/house/HouseView';

export const metadata: Metadata = { title: 'Casa · Faxyna' };

export default function Page() {
  return <HouseView />;
}
