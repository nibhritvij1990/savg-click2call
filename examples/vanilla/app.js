import { createClient } from '../../library/src/index.ts';

const el = (id) => document.getElementById(id);
const logs = el('logs');
const statusEl = el('status');

function log(msg) {
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

let client = null;
let activeCall = null;

// Persist/restore inputs
const KEYS = ['sbcWssUrl','sipDomain','iceServers','botId','phoneNumber','context','to','speaker','mic'];
function saveInputs() {
  KEYS.forEach((k) => localStorage.setItem(`c2c:${k}`, el(k)?.value ?? ''));
}
function loadInputs() {
  KEYS.forEach((k) => {
    const v = localStorage.getItem(`c2c:${k}`);
    if (v != null && el(k)) el(k).value = v;
  });
}
loadInputs();
KEYS.forEach((k) => el(k)?.addEventListener('input', saveInputs));

function parseIceServers(raw) {
  const fallback = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (!raw) return fallback;
  // Try strict JSON first
  try {
    // Sanitize common non-JSON inputs like [{urls:["stun:..."]}]
    let fixed = raw
      .replace(/(\{|,|\s)(urls)\s*:/g, '$1"urls":')
      .replace(/(\{|,|\s)(url)\s*:/g, '$1"url":');
    const parsed = JSON.parse(fixed);
    if (Array.isArray(parsed)) {
      // Normalize: strings → { urls: string }, objects → ensure urls property
      const norm = parsed.map((item) => {
        if (!item) return null;
        if (typeof item === 'string') return { urls: item };
        if (Array.isArray(item)) return null; // ignore invalid nested arrays
        const out = {};
        if (item.urls) out.urls = item.urls; else if (item.url) out.urls = item.url;
        if (item.username) out.username = item.username;
        if (item.credential) out.credential = item.credential;
        return out.urls ? out : null;
      }).filter(Boolean);
      return norm.length ? norm : fallback;
    }
  } catch {}
  // Accept comma or whitespace-separated list of URLs
  const parts = raw.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length) return parts.map((u) => ({ urls: u }));
  return fallback;
}

async function ensureClient() {
  if (client) return client;
  const config = {
    sbcWssUrl: el('sbcWssUrl').value,
    sipDomain: el('sipDomain').value,
    iceServers: parseIceServers(el('iceServers')?.value || ''),
    displayName: 'Agent',
    botId: el('botId').value,
    phoneNumber: el('phoneNumber').value,
    context: el('context').value || undefined,
    auth: { username: 'REPLACE_ME', password: 'REPLACE_ME' },
  };
  client = createClient(config);
  client.on('registration:success', () => { statusEl.textContent = 'Registered'; log('Registered'); });
  return client;
}

async function populateMics() {
  const c = await ensureClient();
  const { mics, speakers } = await c.getDevices();
  const micSel = el('mic');
  micSel.innerHTML = '';
  mics.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d.deviceId;
    opt.textContent = d.label || `Mic ${d.deviceId.slice(0, 6)}`;
    micSel.appendChild(opt);
  });
  const spSel = el('speaker');
  spSel.innerHTML = '';
  const defaultOpt = document.createElement('option');
  defaultOpt.value = 'default';
  defaultOpt.textContent = 'Default';
  spSel.appendChild(defaultOpt);
  speakers.forEach((d) => {
    const opt = document.createElement('option');
    opt.value = d.deviceId;
    opt.textContent = d.label || `Sp ${d.deviceId.slice(0, 6)}`;
    spSel.appendChild(opt);
  });
  // Restore persisted selections
  const savedMic = localStorage.getItem('c2c:mic');
  if (savedMic) micSel.value = savedMic;
  const savedSp = localStorage.getItem('c2c:speaker');
  if (savedSp) spSel.value = savedSp;
}
// Persist selection changes
el('mic')?.addEventListener('change', () => { saveInputs(); });
el('speaker')?.addEventListener('change', async () => {
  saveInputs();
  const c = await ensureClient();
  await c.setOutputDevice(el('speaker').value || 'default');
});

el('btnCall').addEventListener('click', async () => {
  const c = await ensureClient();
  // Apply selected speaker
  const speakerId = el('speaker').value || 'default';
  await c.setOutputDevice(speakerId);
  // Single action: register then call
  statusEl.textContent = 'Registering...';
  log('Registering...');
  await c.register();
  statusEl.textContent = 'Calling';
  log('Calling...');
  activeCall = await c.call({ to: el('to').value || undefined });
  statusEl.textContent = 'Calling';
  log('Invite sent');
});

el('btnHangup').addEventListener('click', async () => {
  if (activeCall) {
    await activeCall.hangup();
    log('Hung up');
    statusEl.textContent = 'Idle';
  }
});

el('btnMute').addEventListener('click', () => activeCall?.mute());
el('btnUnmute').addEventListener('click', () => activeCall?.unmute());
el('btnHold').addEventListener('click', () => activeCall?.hold());
el('btnResume').addEventListener('click', () => activeCall?.resume());
el('btnDTMF').addEventListener('click', () => activeCall?.sendDTMF('1'));

populateMics().catch(console.error);


