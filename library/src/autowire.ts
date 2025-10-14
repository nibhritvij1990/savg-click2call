import { createClient } from './index';
import type { Client, ClientConfig } from './types';

type AutoWireOptions = {
  selector?: string;
};

const clientCache: Map<string, Client> = new Map();
const inFlightButtons: WeakSet<Element> = new WeakSet();
let overlayRoot: HTMLElement | null = null;
let overlayTimerId: number | null = null;
let overlayStartTs: number | null = null;
let overlayMuted = false;

function ensureOverlayStyles() {
  if (document.getElementById('savg-c2c-styles')) return;
  const style = document.createElement('style');
  style.id = 'savg-c2c-styles';
  style.textContent = `
  .savg-c2c-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999}
  .savg-c2c-card{background:#111;color:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.35);width:min(92vw,380px);padding:20px;display:flex;flex-direction:column;gap:14px;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
  .savg-c2c-title{display:flex;flex-direction:column;gap:6px}
  .savg-c2c-row{display:flex;align-items:center;justify-content:space-between}
  .savg-c2c-wave{display:flex;gap:3px;height:26px;align-items:flex-end}
  .savg-c2c-wave span{display:block;width:4px;background:#2ecc71;border-radius:2px;animation:savgPulse 1.2s ease-in-out infinite}
  .savg-c2c-wave span:nth-child(2){animation-delay:.1s}
  .savg-c2c-wave span:nth-child(3){animation-delay:.2s}
  .savg-c2c-wave span:nth-child(4){animation-delay:.3s}
  .savg-c2c-wave span:nth-child(5){animation-delay:.4s}
  @keyframes savgPulse{0%{height:4px}50%{height:24px}100%{height:4px}}
  .savg-c2c-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .savg-c2c-btn{padding:12px;border-radius:10px;border:1px solid #333;background:#1b1b1b;color:#fff;cursor:pointer}
  .savg-c2c-btn:hover{background:#242424}
  .savg-c2c-actions{display:flex;gap:10px}
  .savg-c2c-danger{background:#d63031;border-color:#c23616}
  .savg-c2c-muted{background:#444}
  .savg-c2c-meta{opacity:.8;font-size:12px}
  .savg-c2c-timer{font-feature-settings:"tnum" 1}
  `;
  document.head.appendChild(style);
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function showOverlay(opts: { number: string; botLabel: string; onDTMF: (d: string) => void; onMuteToggle: () => void; onHangup: () => void; }): { startTimer: () => void; stop: () => void; setMuted: (m: boolean) => void } {
  ensureOverlayStyles();
  if (overlayRoot) overlayRoot.remove();
  overlayRoot = document.createElement('div');
  overlayRoot.className = 'savg-c2c-overlay';
  overlayRoot.innerHTML = `
    <div class="savg-c2c-card">
      <div class="savg-c2c-title">
        <div class="savg-c2c-row"><strong>Calling</strong><span class="savg-c2c-timer">00:00</span></div>
        <div class="savg-c2c-meta">To: <span class="savg-c2c-number"></span></div>
        <div class="savg-c2c-meta">Bot: <span class="savg-c2c-bot"></span></div>
      </div>
      <div class="savg-c2c-wave" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="savg-c2c-keypad"></div>
      <div class="savg-c2c-actions">
        <button class="savg-c2c-btn savg-c2c-mute">Mute</button>
        <button class="savg-c2c-btn savg-c2c-danger savg-c2c-hangup">End</button>
      </div>
    </div>`;
  document.body.appendChild(overlayRoot);
  (overlayRoot.querySelector('.savg-c2c-number') as HTMLElement).textContent = opts.number || 'Unknown';
  (overlayRoot.querySelector('.savg-c2c-bot') as HTMLElement).textContent = opts.botLabel || 'Bot';
  const keypad = overlayRoot.querySelector('.savg-c2c-keypad') as HTMLElement;
  const keys = ['1','2','3','4','5','6','7','8','9','*','0','#'];
  keys.forEach(k => {
    const b = document.createElement('button');
    b.className = 'savg-c2c-btn';
    b.textContent = k;
    b.addEventListener('click', () => opts.onDTMF(k));
    keypad.appendChild(b);
  });
  const muteBtn = overlayRoot.querySelector('.savg-c2c-mute') as HTMLButtonElement;
  muteBtn.addEventListener('click', () => opts.onMuteToggle());
  const endBtn = overlayRoot.querySelector('.savg-c2c-hangup') as HTMLButtonElement;
  endBtn.addEventListener('click', () => opts.onHangup());

  const timerEl = overlayRoot.querySelector('.savg-c2c-timer') as HTMLElement;
  const startTimer = () => {
    overlayStartTs = Date.now();
    if (overlayTimerId) window.clearInterval(overlayTimerId);
    overlayTimerId = window.setInterval(() => {
      if (overlayStartTs != null) timerEl.textContent = formatDuration(Date.now() - overlayStartTs);
    }, 500) as unknown as number;
  };
  const stop = () => {
    if (overlayTimerId) window.clearInterval(overlayTimerId);
    overlayTimerId = null; overlayStartTs = null; overlayMuted = false;
    if (overlayRoot) { overlayRoot.remove(); overlayRoot = null; }
  };
  const setMuted = (m: boolean) => {
    overlayMuted = m;
    muteBtn.textContent = m ? 'Unmute' : 'Mute';
    muteBtn.classList.toggle('savg-c2c-muted', m);
  };
  return { startTimer, stop, setMuted };
}

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
      // Disable the call button during call flow
      (btn as HTMLButtonElement).disabled = true;
      // Ensure output device if provided
      if (config.audio?.outputDeviceId) {
        await client.setOutputDevice(config.audio.outputDeviceId);
      }
      // Register (no-op if already registered)
      await client.register();
      // Place call
      const dialingNumber = config.phoneNumber || '';
      const botLabel = (btn.dataset.botName as string) || config.botId;
      const ui = showOverlay({
        number: dialingNumber,
        botLabel,
        onDTMF: (d) => {
          try { active?.sendDTMF(d); } catch {}
        },
        onMuteToggle: () => {
          overlayMuted = !overlayMuted;
          if (overlayMuted) { try { active?.mute(); } catch {} } else { try { active?.unmute(); } catch {} }
          ui.setMuted(overlayMuted);
        },
        onHangup: async () => { try { await active?.hangup(); } catch {} }
      });

      let active = await client.call({ to: to || undefined });
      // Start timer on answer/confirm
      try { active.on('accepted', () => ui.startTimer()); } catch {}
      try { active.on('confirmed', () => ui.startTimer()); } catch {}
      // Close UI and re-enable on end/fail
      const cleanup = () => { ui.stop(); (btn as HTMLButtonElement).disabled = false; };
      try { active.on('ended', cleanup); } catch {}
      try { active.on('failed', cleanup); } catch {}
    } catch (e) {
      console.error('[SavgClick2Call] Call failed:', e);
    } finally {
      inFlightButtons.delete(btn);
    }
  };

  // Event delegation
  document.addEventListener('click', handler);
}


