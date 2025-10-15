import { Emitter } from './events';
import { SIP_USERNAME, SIP_PASSWORD } from './auth';
import type { ClientConfig, Client, Call } from './types';

declare global {
  interface Window {
    AudioCodesUA?: any;
  }
}

export class AudioCodesClient implements Client {
  private emitter = new Emitter();
  private config: ClientConfig;
  private ua: any | null = null;
  private isJsSipUA = false;
  private lastSession: any | null = null;
  private isRegistered = false;
  private remoteAudioEl: HTMLAudioElement | null = null;

  constructor(config: ClientConfig) {
    this.config = {
      autoGreet: false,
      greetUrl: '/hello.mp3',
      ...config
    };
    // Ensure default audio output device
    this.config.audio = {
      outputDeviceId: 'default',
      ...(this.config.audio || {})
    };
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler);
  }

  private ensureRemoteAudioEl() {
    if (this.remoteAudioEl) return this.remoteAudioEl;
    const el = document.createElement('audio');
    el.autoplay = true;
    // @ts-ignore playsInline is supported in browsers for inline playback
    el.playsInline = true;
    el.style.display = 'none';
    el.id = 'savg-c2c-remote-audio';
    document.body.appendChild(el);
    this.remoteAudioEl = el;
    return el;
  }

  private async setSinkId(el: HTMLAudioElement, deviceId: string) {
    // @ts-ignore
    if (typeof el.sinkId === 'undefined') return; // not supported
    try {
      // @ts-ignore
      await el.setSinkId(deviceId);
    } catch (e) {
      // ignore, not critical
    }
  }

  async register(): Promise<void> {
    const g: any = window as any;
    const UA = g.AudioCodesUA || g.JsSIP?.AudioCodesUA;
    if (UA) {
      if (!this.ua) {
        const uaOptions = {
          serverConfig: {
            addresses: [this.config.sbcWssUrl],
            domain: this.config.sipDomain
          },
          account: {
            user: `${SIP_USERNAME}@${this.config.sipDomain}`,
            userAuth: SIP_USERNAME,
            displayName: this.config.displayName || SIP_USERNAME,
            password: SIP_PASSWORD,
            registerExpires: 600
          },
          constraints: { audio: true, video: false },
          iceServers: this.config.iceServers
        };
        try {
          this.ua = new UA(uaOptions);
        } catch {
          const Ctor = (UA as any)?.default || (UA as any)?.UA || (UA as any)?.AudioCodesUA || UA;
          this.ua = new Ctor(uaOptions);
        }
      }
      this.isJsSipUA = false;
      this.emitter.emit('registration:attempt');
      await this.ua.start?.();
      // Assume start triggers internal REGISTER flow in AudioCodesUA. If not, consumers can call again.
      this.isRegistered = true;
      this.emitter.emit('registration:success');
      return;
    }
    // Fallback to plain JsSIP
    if (!g.JsSIP) throw new Error('AudioCodesUA not found. Ensure ac_webrtc.min.js is loaded before app.js');
    const socket = new g.JsSIP.WebSocketInterface(this.config.sbcWssUrl);
    const configuration = {
      sockets: [socket],
      uri: `sip:${SIP_USERNAME}@${this.config.sipDomain}`,
      password: SIP_PASSWORD,
      display_name: this.config.displayName || SIP_USERNAME,
      session_timers: false,
      register: true,
      register_expires: 600
    };
    if (!this.ua) {
      this.ua = new g.JsSIP.UA(configuration);
      this.isJsSipUA = true;
      this.ua.on('registered', () => { this.isRegistered = true; this.emitter.emit('registration:success'); });
      this.ua.on('unregistered', () => { this.isRegistered = false; });
      this.ua.on('registrationFailed', (e: any) => { this.isRegistered = false; this.emitter.emit('registration:error', e?.cause); });
      this.ua.on('newRTCSession', (e: any) => {
        this.lastSession = e.session;
        const remoteEl = this.ensureRemoteAudioEl();
        const pc = this.lastSession?.connection;
        if (pc) {
          pc.addEventListener('track', (ev: any) => {
            const stream = ev.streams && ev.streams[0];
            if (stream) remoteEl.srcObject = stream;
          });
        }
      });
    }
    // Short-circuit if already registered
    if (this.isRegistered) {
      return;
    }
    this.emitter.emit('registration:attempt');
    await new Promise<void>((resolve, reject) => {
      const onRegistered = () => {
        this.isRegistered = true;
        this.emitter.emit('registration:success');
        resolve();
      };
      const onRegFailed = (e: any) => {
        this.isRegistered = false;
        this.emitter.emit('registration:error', e?.cause);
        reject(new Error(e?.cause || 'registrationFailed'));
      };
      try {
        this.ua.on('registered', onRegistered);
        this.ua.on('registrationFailed', onRegFailed);
      } catch {}
      this.ua.start();
    });
  }

  async unregister(): Promise<void> {
    await this.ua?.stop?.();
  }

  async call(options?: { to?: string; headers?: Record<string, string> }): Promise<Call> {
    const to = options?.to || `sip:${this.config.botId}@${this.config.sipDomain}`;
    const headers: Record<string, string> = {
      'X-PHONE-NUMBER': this.config.phoneNumber,
      'X-Bot-Id': this.config.botId,
      ...((this.config.context ? { 'X-CTC-Context': this.config.context } : {})),
      ...(this.config.headers || {}),
      ...(options?.headers || {})
    };

    const remoteEl = this.ensureRemoteAudioEl();
    await this.setSinkId(remoteEl, this.config.audio?.outputDeviceId || 'default');

    let session: any = null;
    if (this.isJsSipUA) {
      const extraHeaders = Object.entries(headers).map(([k, v]) => `${k}: ${v}`);
      const options = {
        extraHeaders,
        mediaConstraints: { audio: true, video: false },
        pcConfig: { iceServers: this.config.iceServers }
      };
      session = this.ua.call(to, options);
    } else {
      // Place the call using AudioCodesUA
      session = await this.ua?.call?.(to, { headers });
    }

    // AudioCodesUA path: try getRemoteStream
    if (session?.getRemoteStream) {
      const stream: MediaStream = session.getRemoteStream();
      remoteEl.srcObject = stream;
    }

    const call: Call = {
      hangup: async () => {
        try {
          if (session?.isEnded && session.isEnded()) return;
          if (typeof session?.bye === 'function') {
            await session.bye();
          } else if (typeof session?.terminate === 'function') {
            await session.terminate();
          }
        } catch {}
      },
      mute: () => { session?.mute?.({ audio: true }); },
      unmute: () => { session?.unmute?.({ audio: true }); },
      hold: async () => { await (session?.hold?.() ?? session?.hold?.({ useUpdate: true })); },
      resume: async () => { await (session?.unhold?.() ?? session?.unhold?.({ useUpdate: true })); },
      sendDTMF: (digits: string) => { session?.sendDTMF?.(digits); },
      on: (event: string, handler: (...args: any[]) => void) => { session?.on?.(event, handler); }
    };

    // Auto-greet after answered
    if (this.config.autoGreet) {
      const onAccepted = async () => {
        this.emitter.emit('call:answered');
        try {
          await this.playGreetIntoSession(session, this.config.greetUrl!);
        } catch {}
      };
      if (session?.on) session.on('accepted', onAccepted);
      if (this.isJsSipUA && session?.on) session.on('confirmed', onAccepted);
    }

    return call;
  }

  async getDevices(): Promise<{ mics: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] }> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((d) => d.kind === 'audioinput');
    const speakers = devices.filter((d) => d.kind === 'audiooutput');
    return { mics, speakers };
  }

  async setMicrophone(deviceId: string): Promise<void> {
    // Placeholder; depends on underlying UA sender track API
  }

  async setOutputDevice(deviceId: string): Promise<void> {
    const el = this.ensureRemoteAudioEl();
    await this.setSinkId(el, deviceId || 'default');
  }

  async teardown(): Promise<void> {
    await this.ua?.stop?.();
    this.ua = null;
  }

  private async playGreetIntoSession(session: any, url: string) {
    const ac = new AudioContext();
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const audioBuffer = await ac.decodeAudioData(buf);
    const src = ac.createBufferSource();
    src.buffer = audioBuffer;
    const dest = ac.createMediaStreamDestination();
    src.connect(dest);
    src.start();
    // Switch outbound track to greeting if supported
    if (session?.replaceOutgoingTrack) {
      const [track] = dest.stream.getAudioTracks();
      await session.replaceOutgoingTrack(track);
      src.addEventListener('ended', async () => {
        await session.restoreMicrophoneTrack?.();
      });
    }
  }
}


