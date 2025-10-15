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
let analyserRAF: number | null = null;

function ensureOverlayStyles() {
  if (document.getElementById('savg-c2c-styles')) return;
  const style = document.createElement('style');
  style.id = 'savg-c2c-styles';
  style.textContent = `
  .savg-c2c-overlay { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); height: min(98svh, 1000px); width: min(98svw, 800px); display: flex; align-items: center; justify-content: center; z-index: 99999; }
  .savg-c2c-card-wrapper { width: 404px; height: 862px; position: relative; z-index: 1; }
  .savg-c2c-card { background: #1c1c1e; color: #e5e5e5; border-radius: 24px; height: 862px; width: 400px; margin: 0 2px; padding: 80px 0 0 0; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; box-shadow: inset 0 0 12px #8d8d86, inset 0 7px 0 3px #1077d7, inset 0 -6px 0 3px #1077d7; }
  .savg-c2c-card-wrapper{ will-change: transform, filter; transform-origin: center; }
  .savg-c2c-card-wrapper.crt-enter{ animation: savgCrtIn 320ms ease-out forwards; }
  .savg-c2c-card-wrapper.crt-exit{ animation: savgCrtOut 280ms ease-in forwards; }
  @keyframes savgCrtIn{ 0%{ transform: scaleX(0) scaleY(0); filter: brightness(.7);} 50%{ transform: scaleX(1) scaleY(.02);} 100%{ transform: scaleX(1) scaleY(1); filter:none;} }
  @keyframes savgCrtOut{ 0%{ transform: scaleX(1) scaleY(1);} 50%{ transform: scaleX(1) scaleY(.02);} 100%{ transform: scaleX(0) scaleY(0);} }
  .savg-c2c-title { display: flex; flex-direction: column; gap: 6px; }
  .savg-c2c-meta { display: flex; align-items: center; justify-content: center; }
  .savg-c2c-timer { font-feature-settings: "tnum" 1; font-size: 16px; }
  .savg-c2c-number { font-size: 32px; }
  .savg-c2c-bot { font-size: 14px; }
  .savg-c2c-wave { display: flex; gap: 4px; height: 64px; align-items: flex-end; justify-content: center; }
  .savg-c2c-wave span { display: block; width: 8px; background: #2ecc71; border-radius: 2px; animation: savgPulse 1.2s ease-in-out; min-height: 4px; }
  .savg-c2c-wave span:nth-child(odd){ background:#4da3ff; }
  .savg-c2c-wave span:nth-child(even){ background:#2ecc71; }
  @keyframes savgPulse { 0% { height: 64px; } 100% { height: 4px; } }
  .savg-c2c-keypad-wrapper { background: #2c2c2e; padding: 40px 20px 80px 20px; border-radius: 24px; margin: 0 3px 9px 3px; display: flex; flex-direction: column; gap: 16px; }
  .savg-c2c-keypad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .savg-c2c-btn { padding: 8px; border-radius: 1000px; border: 1px solid #3a3a3c; background: #3a3a3c; color: #e3e3e3; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
  .savg-c2c-btn .n { font-size: 16px; }
  .savg-c2c-btn .l { font-size: 12px; opacity: 0.5; }
  .savg-c2c-btn:hover { background: #242424; }
  .savg-c2c-btn:not(.savg-c2c-hangup):active { background: #999; color: #3a3a3c; border-radius: 16px; }
  .savg-c2c-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .savg-c2c-mute, .savg-c2c-hangup { padding: 16px; font-size: 20px; }
  .savg-c2c-danger { background: #c23616; border-color: #c23616; grid-column: 2 / 4; }
  .savg-c2c-danger:hover { background: #d63031; border-color: #d63031; }
  .savg-c2c-muted { background: #999; color: #3a3a3c; border-radius: 16px;}
  .savg-c2c-muted:hover { background: #777; }
  .device-stripe::before { background: #16589b; bottom: 0; content: ""; height: 9px; left: 50%; margin-left: 40px; position: absolute; width: 11px; }
  .device-stripe::after { background: linear-gradient(to top, #121212, #666661); border-radius: 50px 50px 0 0; bottom: 0; content: ""; height: 2px; left: 50%; margin-left: -22px; position: absolute; width: 44px; }
  .device-header { background: linear-gradient(to bottom, #8d8d86 0, #16589b 30%, #16589b 100%); height: 10px; left: 50%; margin-left: -147px; position: absolute; top: 0; width: 294px; }
  .device-sensors { background: #121212; border-radius: 50%; height: 22px; left: 50%; margin-left: -11px; margin-top: -11px; position: absolute; top: 39px; width: 22px; }
  .device-sensors::before { background: radial-gradient(farthest-corner at 20% 20%, #6074bf 0, transparent 40%), radial-gradient(farthest-corner at 80% 80%, #513785 0, #24555e 20%, transparent 50%); border-radius: 50%; box-shadow: 0 0 1px 1px rgba(255, 255, 255, .05); height: 8px; left: 7px; top: 7px; width: 8px; content: ""; position: absolute; }
  .device-sensors::after { background: linear-gradient(to bottom, #121212, #666661); border-radius: 0 0 50px 50px; height: 4px; left: 50%; margin-left: -103px; top: -18px; width: 206px; content: ""; position: absolute; }
  .device-btns { background: #16589b; height: 102px; position: absolute; right: 0; top: 306px; width: 3px; }
  .device-power { background: #16589b; height: 58px; position: absolute; right: 0; top: 194px; width: 3px; }

  .savg-c2c-overlay { box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1), 0 -1px 1px 0 white, 0 1px 1px 0 white, 1px 1px 1px 0 rgba(0, 0, 0, 0.2), -1px 0 1px 0 rgba(0, 0, 0, 0.2), 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 24px; }
  .liquidGlass-effect { position: absolute; z-index: 0; inset: 0; backdrop-filter: blur(2px); filter: url(#glass-distortion); overflow: hidden; isolation: isolate; border-radius: inherit; }
  .liquidGlass-tint { z-index: 1; position: absolute; inset: 0; background: rgba(255, 255, 255, 0.25); border-radius: inherit; }
  .liquidGlass-shine { position: absolute; inset: 0; z-index: 2; overflow: hidden; box-shadow: inset 2px 2px 1px 0 rgba(255, 255, 255, 0.5), inset -1px -1px 1px 1px rgba(255, 255, 255, 0.5); border-radius: inherit; }
  .liquidGlass-text { z-index: 3; position: relative; border-radius: inherit; }
  `;
  document.head.appendChild(style);
}

function ensureBootstrapIcons() {
  // Load Bootstrap Icons if not already present
  const href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css';
  const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((l) => (l as HTMLLinkElement).href.includes('bootstrap-icons'));
  if (!existing) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.id = 'savg-c2c-bootstrap-icons';
    document.head.appendChild(link);
  }
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function showOverlay(opts: { number: string; botLabel: string; onDTMF: (d: string) => void; onMuteToggle: () => void; onHangup: () => void; }): { startTimer: () => void; stop: () => void; setMuted: (m: boolean) => void } {
  ensureOverlayStyles();
  ensureBootstrapIcons();
  if (overlayRoot) overlayRoot.remove();
  overlayRoot = document.createElement('div');
  overlayRoot.className = 'savg-c2c-overlay';
  overlayRoot.innerHTML = `
    <div class="liquidGlass-effect"></div>
    <div class="liquidGlass-tint"></div>
    <div class="liquidGlass-shine"></div>
    <div class="liquidGlass-text">
    <div class="savg-c2c-card-wrapper">
      <div class="savg-c2c-card">
        <div class="savg-c2c-title">
          <div class="savg-c2c-meta"><span class="savg-c2c-timer">connecting...</span></div>
          <div class="savg-c2c-meta"><span class="savg-c2c-number">data-botPhoneNumber</span></div>
          <div class="savg-c2c-meta"><span class="savg-c2c-bot">data-botName</span></div>
        </div>
        <div class="savg-c2c-wave" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span><span></span>
          <span></span><span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="savg-c2c-keypad-wrapper">
          <div class="savg-c2c-keypad">
            <button class="savg-c2c-btn" data-key="1"><span class="n">1</span></button>
            <button class="savg-c2c-btn" data-key="2"><span class="n">2</span><span class="l">ABC</span></button>
            <button class="savg-c2c-btn" data-key="3"><span class="n">3</span><span class="l">DEF</span></button>
            <button class="savg-c2c-btn" data-key="4"><span class="n">4</span><span class="l">GHI</span></button>
            <button class="savg-c2c-btn" data-key="5"><span class="n">5</span><span class="l">JKL</span></button>
            <button class="savg-c2c-btn" data-key="6"><span class="n">6</span><span class="l">MNO</span></button>
            <button class="savg-c2c-btn" data-key="7"><span class="n">7</span><span class="l">PQRS</span></button>
            <button class="savg-c2c-btn" data-key="8"><span class="n">8</span><span class="l">TUV</span></button>
            <button class="savg-c2c-btn" data-key="9"><span class="n">9</span><span class="l">WXYZ</span></button>
            <button class="savg-c2c-btn" data-key="*"><span class="n">*</span></button>
            <button class="savg-c2c-btn" data-key="0"><span class="n">0</span><span class="l">+</span></button>
            <button class="savg-c2c-btn" data-key="#"><span class="n">#</span></button>
            </div>
            <div class="savg-c2c-actions">
              <button id="btnMute" class="control savg-c2c-btn savg-c2c-mute" title="Mute/Unmute" aria-label="Mute/Unmute"><i class="bi bi-mic" aria-hidden="true"></i></button>
              <button id="btnEnd" class="hangup savg-c2c-btn savg-c2c-danger savg-c2c-hangup" title="End Call" aria-label="End call"><i class="bi bi-telephone-x" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>
        <div class="device-stripe"></div>
        <div class="device-header"></div>
        <div class="device-sensors"></div>
        <div class="device-btns"></div>
        <div class="device-power"></div>
      </div>
    </div>

    <svg style="display: none">
      <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves="1" seed="5" result="turbulence" />
        <feComponentTransfer in="turbulence" result="mapped">
        <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
        <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
        <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting in="softMap" surfaceScale="5" specularConstant="1" specularExponent="100" lighting-color="white" result="specLight">
        <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite in="specLight" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litImage" />
        <feDisplacementMap in="SourceGraphic" in2="softMap" scale="150" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>`;
  document.body.appendChild(overlayRoot);
  (overlayRoot.querySelector('.savg-c2c-number') as HTMLElement).textContent = opts.number || 'Unknown';
  (overlayRoot.querySelector('.savg-c2c-bot') as HTMLElement).textContent = opts.botLabel || 'Bot';
  // CRT open animation
  const cardEl = overlayRoot.querySelector('.savg-c2c-card-wrapper') as HTMLElement | null;
  if (cardEl) {
    cardEl.classList.add('crt-enter');
    cardEl.addEventListener('animationend', () => {
      cardEl.classList.remove('crt-enter');
    }, { once: true });
  }

  // Dynamic scale: keep card visible within viewport without conflicting with CRT animation
  const scaleHost = overlayRoot.querySelector('.liquidGlass-text') as HTMLElement | null;
  const baseW = 404; // design width
  const baseH = 862; // design height
  const applyScale = () => {
    if (!scaleHost) return;
    const vw = Math.max(1, window.innerWidth);
    const vh = Math.max(1, window.innerHeight);
    const s = Math.min(vw / baseW, vh / baseH, 1);
    scaleHost.style.transform = `scale(${(s==1?s:0.95*s)})`;
    scaleHost.style.transformOrigin = 'center';
  };
  applyScale();
  const onResize = () => applyScale();
  window.addEventListener('resize', onResize);
  
  const muteBtn = overlayRoot.querySelector('.savg-c2c-mute') as HTMLButtonElement;
  muteBtn.addEventListener('click', () => opts.onMuteToggle());
  const endBtn = overlayRoot.querySelector('.savg-c2c-hangup') as HTMLButtonElement;
  endBtn.addEventListener('click', () => opts.onHangup());
  // Keypad DTMF feedback tones
  const keypad = overlayRoot.querySelector('.savg-c2c-keypad') as HTMLElement;
  keypad.querySelectorAll('.savg-c2c-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const k = (btn as HTMLElement).getAttribute('data-key') || (btn as HTMLElement).textContent || '';
      const map: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477]
      };
      const f = map[k.trim()];
      if (f) {
        try {
          const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
          const ctx = new AC();
          const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(ctx.destination);
          const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = f[0]; o1.connect(g);
          const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f[1]; o2.connect(g);
          const now = ctx.currentTime;
          g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
          o1.start(now); o2.start(now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
          o1.stop(now + 0.16); o2.stop(now + 0.16);
          setTimeout(() => { try { ctx.close(); } catch {} }, 220);
        } catch {}
      }
    });
  });

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
    if (analyserRAF) { cancelAnimationFrame(analyserRAF); analyserRAF = null; }
    const doRemove = () => { if (overlayRoot) { overlayRoot.remove(); overlayRoot = null; } };
    // CRT close animation
    const card = overlayRoot?.querySelector('.savg-c2c-card-wrapper') as HTMLElement | null;
    if (card) {
      card.classList.add('crt-exit');
      let removed = false;
      card.addEventListener('animationend', () => { if (!removed) { removed = true; doRemove(); } }, { once: true });
      // Fallback in case animation events are blocked
      setTimeout(() => { if (!removed) { removed = true; doRemove(); } }, 400);
    } else {
      doRemove();
    }
    window.removeEventListener('resize', onResize);
  };
  const setMuted = (m: boolean) => {
    overlayMuted = m;
    const icon = muteBtn.querySelector('i');
    if (icon) (icon as HTMLElement).className = m ? 'bi bi-mic-mute' : 'bi bi-mic';
    muteBtn.setAttribute('aria-label', m ? 'Unmute' : 'Mute');
    muteBtn.title = m ? 'Unmute' : 'Mute';
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
  const botName = normalizeDatasetValue(d, 'botName') || normalizeDatasetValue(d, 'botname');
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
    botName,
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
  const selector = options?.selector || '.click2CallBtn';
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
      // Show dialer immediately in connecting state
      const dialingNumber = config.phoneNumber || '';
      const botLabel = (btn.dataset.botName as string) || config.botName || config.botId;
      let active: any;
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
      // Ensure output device if provided
      if (config.audio?.outputDeviceId) {
        await client.setOutputDevice(config.audio.outputDeviceId);
      }
      // Register (no-op if already registered)
      await client.register();
      // Place call
      active = await client.call({ to: to || undefined });
      // Start timer on answer/confirm and attach audio analyser for waveform (after media is flowing)
      const tryStartAnalyser = async () => {
        const remoteEl = document.getElementById('savg-c2c-remote-audio') as HTMLAudioElement | null;
        const barsNode = overlayRoot?.querySelectorAll('.savg-c2c-wave span') || null;
        const bars: HTMLElement[] | null = barsNode ? Array.from(barsNode) as HTMLElement[] : null;
        // Wait briefly if stream is not yet attached
        let stream: MediaStream | null = null;
        const maxWait = 100; // ~5s total
        for (let i = 0; i < maxWait; i++) {
          if (remoteEl && remoteEl.srcObject instanceof MediaStream) { stream = remoteEl.srcObject as MediaStream; break; }
          await new Promise(r => setTimeout(r, 50));
        }
        if (!stream || !bars || !bars.length) return;
        // Disable CSS animation when reactive
        bars.forEach((b) => { b.style.animation = 'none'; (b as HTMLElement).style.animationName = 'none'; });
        const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        const ac = new AC();
        const src = ac.createMediaStreamSource(stream);
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.7;
        src.connect(analyser);
        const dataF = new Uint8Array(analyser.frequencyBinCount);
        const dataT = new Uint8Array(analyser.fftSize);
        const evenBuckets = [2, 5, 8, 11, 14, 17];
        const oddBuckets  = [3, 6, 9, 12, 15, 18];
        const render = () => {
          analyser.getByteFrequencyData(dataF);
          // If frequency data is near-zero (silence or codec), fall back to time-domain RMS
          let avg = 0;
          const sampleIdx = [...evenBuckets, ...oddBuckets].slice(0, bars.length);
          for (let i = 0; i < sampleIdx.length; i++) avg += dataF[sampleIdx[i]];
          const useTime = avg < sampleIdx.length * 4; // threshold
          if (useTime) analyser.getByteTimeDomainData(dataT);
          bars.forEach((bar, i) => {
            const isOdd = (i % 2) === 1; // odd = mic, even = remote
            const idx = (isOdd ? oddBuckets[Math.floor(i/2)] : evenBuckets[Math.floor(i/2)]) || 2;
            const v = useTime ? Math.abs((dataT[(i * 16) % dataT.length] - 128) / 128) : (dataF[idx] / 255);
            const h = Math.max(4, Math.floor(v * 64));
            bar.style.height = `${h}px`;
          });
          analyserRAF = requestAnimationFrame(render);
        };
        try { await ac.resume(); } catch {}
        render();
        const cleanupAnalyser = () => { if (analyserRAF) { cancelAnimationFrame(analyserRAF); analyserRAF = null; } try { ac.close(); } catch {} };
        try { active.on('ended', cleanupAnalyser); } catch {}
        try { active.on('failed', cleanupAnalyser); } catch {}

        // Start MIC analyser on odd bars (fallback via getUserMedia)
        try {
          const micBars = bars.filter((_, i) => (i % 2) === 1);
          if (micBars.length) {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ACmic: any = (window as any).AudioContext || (window as any).webkitAudioContext;
            const acMic = new ACmic();
            const srcMic = acMic.createMediaStreamSource(micStream);
            const analyserMic = acMic.createAnalyser();
            analyserMic.fftSize = 256;
            analyserMic.smoothingTimeConstant = 0.8;
            srcMic.connect(analyserMic);
            const micF = new Uint8Array(analyserMic.frequencyBinCount);
            const micT = new Uint8Array(analyserMic.fftSize);
            let micRAF: number | null = null;
            const micBuckets = [3, 6, 9, 12, 15, 18];
            const renderMic = () => {
              if (overlayMuted) {
                micBars.forEach((bar) => { bar.style.height = '4px'; });
                micRAF = requestAnimationFrame(renderMic);
                return;
              }
              analyserMic.getByteFrequencyData(micF);
              let avgMic = 0;
              for (let i = 0; i < micBars.length; i++) avgMic += micF[micBuckets[i] || 3];
              const useTimeMic = avgMic < micBars.length * 4;
              if (useTimeMic) analyserMic.getByteTimeDomainData(micT);
              micBars.forEach((bar, i) => {
                const idx = micBuckets[i] || 3;
                const v = useTimeMic ? Math.abs((micT[(i * 16) % micT.length] - 128) / 128) : (micF[idx] / 255);
                const h = Math.max(4, Math.floor(v * 64));
                bar.style.height = `${h}px`;
              });
              micRAF = requestAnimationFrame(renderMic);
            };
            try { await acMic.resume(); } catch {}
            renderMic();
            const cleanupMic = () => {
              if (micRAF) { cancelAnimationFrame(micRAF); micRAF = null; }
              try { acMic.close(); } catch {}
              try { micStream.getTracks().forEach(t => t.stop()); } catch {}
            };
            try { active.on('ended', cleanupMic); } catch {}
            try { active.on('failed', cleanupMic); } catch {}
          }
        } catch {}
      };
      try { active.on('accepted', () => { ui.startTimer(); tryStartAnalyser(); }); } catch {}
      try { active.on('confirmed', () => { ui.startTimer(); tryStartAnalyser(); }); } catch {}
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


