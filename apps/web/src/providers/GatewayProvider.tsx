'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { DataGateway } from '@faxyna/core';

const GatewayContext = createContext<DataGateway | null>(null);

export function GatewayProvider({ gateway, children }: { gateway: DataGateway; children: ReactNode }) {
  return <GatewayContext.Provider value={gateway}>{children}</GatewayContext.Provider>;
}

export function useGateway(): DataGateway {
  const gateway = useContext(GatewayContext);
  if (!gateway) throw new Error('useGateway precisa estar dentro de <GatewayProvider>');
  return gateway;
}
