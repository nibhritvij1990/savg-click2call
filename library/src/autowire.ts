import { createClient } from './index';
import type { Client, ClientConfig } from './types';

type AutoWireOptions = {
  selector?: string;
};

const clientCache: Map<string, Client> = new Map();
const inFlightButtons: WeakSet<Element> = new WeakSet();

function normalizeDatasetValue(dataset: DOMStringMap, key: string): string | undefined {
  const variants = [key, key.toLowerCase(), key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), key.replace(/-/g, '')];
  for (const v of variants) {
    const val = (dataset as any)[v];
    if (val != null && String(val).length > 0) return String(val);
  }
  return undefined;
}

function parseJsonSafe<T = any>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function parseIceServers(raw?: string): RTCIceServer[] {
  const fallback = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (!raw) return fallback;
  const fixed = raw
    .replace(/(\{|,|\s)(urls)\s*:/g, '$1"urls":')
    .replace(/(\{|,|\s)(url)\s*:/g, '$1"url":');
  const parsed = parseJsonSafe<any[]>(fixed);
  if (Array.isArray(parsed)) {
    const norm = parsed.map((item) => {
      if (!item) return null;
      if (typeof item === 'string') return { urls: item } as RTCIceServer;
      if (Array.isArray(item)) return null;
      const out: any = {};
      if (item.urls) out.urls = item.urls; else if (item.url) out.urls = item.url;
      if (item.username) out.username = item.username;
      if (item.credential) out.credential = item.credential;
      return out.urls ? (out as RTCIceServer) : null;
    }).filter(Boolean) as RTCIceServer[];
    if (norm.length) return norm;
  }
  // Try comma/space separated
  const parts = raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length) return parts.map((u) => ({ urls: u }));
  return fallback;
}

function parseAddresses(raw?: string): string[] {
  if (!raw) return [];
  const arr = parseJsonSafe<any[]>(raw);
  if (Array.isArray(arr)) return arr.map(String).filter(Boolean);
  return [raw];
}

function datasetToConfig(el: HTMLElement): { config?: ClientConfig; to?: string } {
  const d = el.dataset as DOMStringMap;
  const addressesRaw = normalizeDatasetValue(d, 'addresses');
  const addresses = parseAddresses(addressesRaw);
  const sbcWssUrl = addresses[0];
  const sipDomain = normalizeDatasetValue(d, 'domain');
  const botId = normalizeDatasetValue(d, 'botId') || normalizeDatasetValue(d, 'botid');
  const phoneNumber = normalizeDatasetValue(d, 'botPhoneNumber') || normalizeDatasetValue(d, 'botphonenumber');
  const context = normalizeDatasetValue(d, 'ctcContext') || normalizeDatasetValue(d, 'ctccontext');
  const iceServersRaw = normalizeDatasetValue(d, 'iceServers');
  const iceServers = parseIceServers(iceServersRaw);
  const outputDeviceId = normalizeDatasetValue(d, 'outputDeviceId') || 'default';
  const displayName = normalizeDatasetValue(d, 'displayName') || 'Agent';
  const autoGreet = normalizeDatasetValue(d, 'autoGreet');
  const to = normalizeDatasetValue(d, 'to');

  if (!sbcWssUrl || !sipDomain || !botId || !phoneNumber) {
    console.error('[SavgClick2Call] Missing required data-* attributes on button. Need addresses, domain, botId, botPhoneNumber.');
    return {};
  }

  const config: ClientConfig = {
    sbcWssUrl,
    sipDomain,
    iceServers,
    displayName,
    botId,
    phoneNumber,
    context,
    // auth object is ignored by the client (credentials embedded); provide dummy for type completeness
    auth: { username: 'embedded', password: 'embedded' },
    audio: { outputDeviceId },
    autoGreet: autoGreet ? autoGreet.toLowerCase() === 'true' : undefined,
  } as any;

  return { config, to };
}

function makeCacheKey(cfg: ClientConfig): string {
  return `${cfg.sbcWssUrl}|${cfg.sipDomain}|${cfg.botId}`;
}

export function autoWireCallButtons(options?: AutoWireOptions) {
  const selector = options?.selector || '.callBtn';
  const handler = async (ev: Event) => {
    const target = ev.target as Element | null;
    if (!target) return;
    const btn = (target as Element).closest(selector) as HTMLElement | null;
    if (!btn) return;
    const action = (btn.dataset.action || 'call').toLowerCase();
    if (action !== 'call') return;
    if (inFlightButtons.has(btn)) return;
    inFlightButtons.add(btn);
    try {
      const parsed = datasetToConfig(btn);
      if (!parsed.config) return;
      const { config, to } = parsed;
      const key = makeCacheKey(config);
      let client = clientCache.get(key);
      if (!client) {
        client = createClient(config);
        clientCache.set(key, client);
      }
      // Ensure output device if provided
      if (config.audio?.outputDeviceId) {
        await client.setOutputDevice(config.audio.outputDeviceId);
      }
      // Register (no-op if already registered)
      await client.register();
      // Place call
      await client.call({ to: to || undefined });
    } catch (e) {
      console.error('[SavgClick2Call] Call failed:', e);
    } finally {
      inFlightButtons.delete(btn);
    }
  };

  // Event delegation
  document.addEventListener('click', handler);
}


