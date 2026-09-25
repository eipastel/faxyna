import type { Metadata } from 'next';
import { RoomsView } from '@/features/rooms/RoomsView';

export const metadata: Metadata = { title: 'Cômodos · Faxyna' };

export default function Page() {
  return <RoomsView />;
}
