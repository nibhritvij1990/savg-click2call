savg-click2call
================

Framework-agnostic WebRTC click-to-call library wrapping AudioCodes' WebRTC SDK, with a vanilla demo.

Workspaces
----------

- `library/`: TypeScript library (UMD + ESM)
- `examples/vanilla/`: Minimal demo app

Quickstart (dev)
----------------

```bash
npm install
npm --workspace examples/vanilla run dev -- --host
```

Open the printed URL. Fill SBC WSS URL, SIP domain, botId, phoneNumber (and optional context), ICE servers, mic/speaker. Click Call.

Replace demo SIP creds in `library/src/auth.ts`.

Build
-----

```bash
npm --workspace library run build
npm --workspace examples/vanilla run build
```

Library usage
-------------

UMD global `window.SavgClick2Call.createClient(config)` or ESM `{ createClient }`.

Headers auto-injected on INVITE: `X-PHONE-NUMBER`, `X-Bot-Id`, optional `X-CTC-Context`.

Auto-greet plays `hello-wav.wav` into the outbound stream after answer.

Notes
-----

- Serve over HTTPS for `setSinkId` support.
- Hardcoded SIP creds are visible; use least-privilege.


