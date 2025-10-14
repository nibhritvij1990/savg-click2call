import { AudioCodesClient } from './AudioCodesClient';
import type { ClientConfig, Client } from './types';
import { autoWireCallButtons } from './autowire';

export function createClient(config: ClientConfig): Client {
  return new AudioCodesClient(config);
}

export type { ClientConfig, Client } from './types';

// UMD global
// @ts-ignore
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.SavgClick2Call = { createClient, autoWireCallButtons };
}


