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

Drop-in call buttons
--------------------

You can auto-wire buttons with data-attributes (no custom JS needed):

```html
<script src="https://savg-click2call.netlify.app/ac_webrtc.min.js"></script>
<script src="https://savg-click2call.netlify.app/click2call.umd.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    window.SavgClick2Call.autoWireCallButtons();
  });
  // Optional: window.SavgClick2Call.autoWireCallButtons({ selector: '.myCallBtn' });
});
</script>

<button class="callBtn"
  data-action="call"
  data-addresses='["wss://your-sbc.example.com:443"]'
  data-domain="example.com"
  data-botPhoneNumber="+15551234567"
  data-botId="st-xxxx"
  data-iceServers='[{"urls":"stun:stun.l.google.com:19302"}]'
  data-ctcContext="optional">
  Click 2 Call
</button>
```

The library caches clients per (sbcWssUrl|sipDomain|botId) so multiple buttons reuse registration.

Notes
-----

- Serve over HTTPS for `setSinkId` support.
- Hardcoded SIP creds are visible; use least-privilege.


