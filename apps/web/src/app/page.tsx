import { PageTransition } from '@/components/layout/PageTransition';
import { TodayView } from '@/features/today/TodayView';

export default function Page() {
  return (
    <PageTransition>
      <TodayView />
    </PageTransition>
  );
}
