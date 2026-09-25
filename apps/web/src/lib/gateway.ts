import type { DataGateway } from '@faxyna/core';
import { LocalStorageGateway } from '@faxyna/data-local';

/**
 * The only place in the app that knows a concrete gateway implementation.
 * To switch to Firebase: create `@faxyna/data-firebase` and return it here.
 */
export function createGateway(): DataGateway {
  return new LocalStorageGateway();
}
