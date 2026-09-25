'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { DataGateway } from '@faxyna/core';
import { createGateway } from '@/lib/gateway';

const GatewayContext = createContext<DataGateway | null>(null);

export function GatewayProvider({ children }: { children: ReactNode }) {
  const [gateway] = useState(createGateway);
  return <GatewayContext.Provider value={gateway}>{children}</GatewayContext.Provider>;
}

export function useGateway(): DataGateway {
  const gateway = useContext(GatewayContext);
  if (!gateway) throw new Error('useGateway precisa estar dentro de <GatewayProvider>');
  return gateway;
}
