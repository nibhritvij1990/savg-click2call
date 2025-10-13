export type ClientConfig = {
  sbcWssUrl: string;
  sipDomain: string;
  iceServers: RTCIceServer[];
  displayName?: string;
  botId: string;
  phoneNumber: string;
  context?: string;
  auth: { username: string; password: string };
  audio?: { outputDeviceId?: string; inputDeviceId?: string };
  autoGreet?: boolean;
  greetUrl?: string;
  headers?: Record<string, string>;
};

export type Call = {
  hangup(): Promise<void>;
  mute(): void;
  unmute(): void;
  hold(): Promise<void>;
  resume(): Promise<void>;
  sendDTMF(digits: string): void;
  on(event: string, handler: (...args: any[]) => void): void;
};

export type Client = {
  register(): Promise<void>;
  unregister(): Promise<void>;
  call(options?: { to?: string; headers?: Record<string, string> }): Promise<Call>;
  getDevices(): Promise<{ mics: MediaDeviceInfo[]; speakers: MediaDeviceInfo[] }>;
  setMicrophone(deviceId: string): Promise<void>;
  setOutputDevice(deviceId: string): Promise<void>;
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  teardown(): Promise<void>;
};


