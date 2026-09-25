'use client';

import { useMemo } from 'react';
import { addDays, weekPercent, weekStartOf, weekStats } from '@faxyna/core';
import { useData } from '@/providers/DataProvider';

/** Current week's progress (used in the sidebar, Today and Progress). */
export function useWeekProgress() {
  const { tasks, today, settings } = useData();
  return useMemo(() => {
    const start = weekStartOf(today, settings.weekStartsMonday);
    const stats = weekStats(tasks, start);
    return {
      start,
      end: addDays(start, 6),
      percent: weekPercent(stats),
      summary: stats.done + ' de ' + (stats.done + stats.pending) + ' feitas',
    };
  }, [tasks, today, settings.weekStartsMonday]);
}
