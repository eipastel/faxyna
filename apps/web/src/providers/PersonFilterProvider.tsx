'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { PersonFilter } from '@faxyna/core';
import { useSession } from './SessionProvider';

type Api = [PersonFilter, (p: PersonFilter) => void];

const PersonFilterContext = createContext<Api | null>(null);

/** "All / person" filter shared between Today and Week; starts on your own tasks. */
export function PersonFilterProvider({ children }: { children: ReactNode }) {
  const state = useState<PersonFilter>(useSession().member.uid);
  return <PersonFilterContext.Provider value={state}>{children}</PersonFilterContext.Provider>;
}

export function usePersonFilter(): Api {
  const api = useContext(PersonFilterContext);
  if (!api) throw new Error('usePersonFilter precisa estar dentro de <PersonFilterProvider>');
  return api;
}
