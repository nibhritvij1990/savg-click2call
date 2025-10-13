1. REGISTER #1 - REQUEST
REGISTER sip:unifiedxo-prod-savg.kore.ai SIP/2.0
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK2761968
Max-Forwards: 69
To: <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=gkpk7ia332
Call-ID: 4fmol7jtedto68e8ahntmu
CSeq: 1 REGISTER
Contact: <sip:7g940fcv@mvr5l6dlr1nj.invalid;transport=ws>;+sip.ice;reg-id=1;+sip.instance="<urn:uuid:e7c51e94-305f-496d-a583-7f3050cd0244>";expires=600
Expires: 600
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE
Supported: path,gruu,outbound
User-Agent: JsSIP 3.10.0
Content-Length: 0

2. REGISTER #1 - RESPONSE
SIP/2.0 401 Unauthorized
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK2761968;received=106.222.232.145;rport=5764
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=gkpk7ia332
To: <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=1v7DQDtpU13BN
Call-ID: 4fmol7jtedto68e8ahntmu
CSeq: 1 REGISTER
WWW-Authenticate: Digest realm="unifiedxo-prod-savg.kore.ai", algorithm=MD5, qop="auth", nonce="176029569629600"
Content-Length: 0

3. REGISTER #2 - REQUEST
REGISTER sip:unifiedxo-prod-savg.kore.ai SIP/2.0
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK189697
Max-Forwards: 69
To: <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=gkpk7ia332
Call-ID: 4fmol7jtedto68e8ahntmu
CSeq: 2 REGISTER
Authorization: Digest algorithm=MD5, username="click2call_webrtc", realm="unifiedxo-prod-savg.kore.ai", nonce="176029569629600", uri="sip:unifiedxo-prod-savg.kore.ai", response="ffd4cc4c80d1963e46a72334fef75943", qop=auth, cnonce="j4gpl440q4go", nc=00000001
Contact: <sip:7g940fcv@mvr5l6dlr1nj.invalid;transport=ws>;+sip.ice;reg-id=1;+sip.instance="<urn:uuid:e7c51e94-305f-496d-a583-7f3050cd0244>";expires=600
Expires: 600
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE
Supported: path,gruu,outbound
User-Agent: JsSIP 3.10.0
Content-Length: 0

4. REGISTER #2 - RESPONSE
SIP/2.0 200 OK
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK189697;received=106.222.232.145;rport=5764
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=gkpk7ia332
To: <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=50cHySX4F5vpK
Call-ID: 4fmol7jtedto68e8ahntmu
CSeq: 2 REGISTER
Contact: <sip:7g940fcv@mvr5l6dlr1nj.invalid;transport=ws>;+sip.ice;reg-id=1;+sip.instance="<urn:uuid:e7c51e94-305f-496d-a583-7f3050cd0244>";expires=600
Expires: 600
Content-Length: 0

5. INVITE #1 - REQUEST
INVITE sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai SIP/2.0
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK3668926
Max-Forwards: 69
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5988 INVITE
X-Bot-Id: st-6716b4fb-932b-51c3-a93e-edf5eec809ad
X-PHONE-NUMBER: +12566002038
X-CTC-Context: null
Contact: <sip:7g940fcv@mvr5l6dlr1nj.invalid;transport=ws;ob>
Content-Type: application/sdp
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE
Supported: ice,replaces,outbound
User-Agent: JsSIP 3.10.0
Content-Length: 1683
v=0
o=- 5799141157590757190 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS 53ddb8f4-9d73-46fe-b3d8-d6b0b9e4654c
m=audio 4238 UDP/TLS/RTP/SAVPF 111 63 9 0 8 13 110 126
c=IN IP4 106.222.232.145
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:2104591443 1 udp 2122260223 192.168.1.248 50786 typ host generation 0 network-id 1 network-cost 10
a=candidate:3527107949 1 udp 1686052607 106.222.232.145 4238 typ srflx raddr 192.168.1.248 rport 50786 generation 0 network-id 1 network-cost 10
a=candidate:62809803 1 tcp 1518280447 192.168.1.248 9 typ host tcptype active generation 0 network-id 1 network-cost 10
a=ice-ufrag:aOFc
a=ice-pwd:vlYg6zJ4hh8aD41VreHtbxRP
a=ice-options:trickle
a=fingerprint:sha-256 E3:D7:7E:B8:19:75:20:7D:8C:32:0A:F8:9E:DB:4E:05:15:9B:11:EB:F8:19:5C:BC:0D:F2:2C:25:7C:AD:7D:CD
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=sendrecv
a=msid:53ddb8f4-9d73-46fe-b3d8-d6b0b9e4654c beef31b0-11d6-4006-9e48-c8f56199cb6d
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:63 red/48000/2
a=fmtp:63 111/111
a=rtpmap:9 G722/8000
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:13 CN/8000
a=rtpmap:110 telephone-event/48000
a=rtpmap:126 telephone-event/8000
a=ssrc:954401866 cname:wv25JYZhqsWubI+c
a=ssrc:954401866 msid:53ddb8f4-9d73-46fe-b3d8-d6b0b9e4654c beef31b0-11d6-4006-9e48-c8f56199cb6d

6. INVITE #1 - RESPONSE PART A
SIP/2.0 100 Trying
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK3668926;received=106.222.232.145;rport=5764
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5988 INVITE
Content-Length: 0

7. INVITE #1 - RESPONSE PART B
SIP/2.0 401 Unauthorized
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK3668926;received=106.222.232.145;rport=5764
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>;tag=pU3FN7pH2S0aB
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5988 INVITE
WWW-Authenticate: Digest realm="unifiedxo-prod-savg.kore.ai", algorithm=MD5, qop="auth", nonce="176029570697200"
Content-Length: 0

8. ACK - REQUEST
ACK sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai SIP/2.0
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK3668926
Max-Forwards: 69
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>;tag=pU3FN7pH2S0aB
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5988 ACK
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE
Supported: outbound
User-Agent: JsSIP 3.10.0
Content-Length: 0

9. INVITE #2 - REQUEST
INVITE sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai SIP/2.0
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK1060491
Max-Forwards: 69
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5989 INVITE
Authorization: Digest algorithm=MD5, username="click2call_webrtc", realm="unifiedxo-prod-savg.kore.ai", nonce="176029570697200", uri="sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai", response="04631b13dfb5118e04a7706d89fdddf3", qop=auth, cnonce="nfngmj86s6gs", nc=00000001
X-Bot-Id: st-6716b4fb-932b-51c3-a93e-edf5eec809ad
X-PHONE-NUMBER: +12566002038
X-CTC-Context: null
Contact: <sip:7g940fcv@mvr5l6dlr1nj.invalid;transport=ws;ob>
Content-Type: application/sdp
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE
Supported: ice,replaces,outbound
User-Agent: JsSIP 3.10.0
Content-Length: 1683
v=0
o=- 5799141157590757190 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS 53ddb8f4-9d73-46fe-b3d8-d6b0b9e4654c
m=audio 4238 UDP/TLS/RTP/SAVPF 111 63 9 0 8 13 110 126
c=IN IP4 106.222.232.145
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:2104591443 1 udp 2122260223 192.168.1.248 50786 typ host generation 0 network-id 1 network-cost 10
a=candidate:3527107949 1 udp 1686052607 106.222.232.145 4238 typ srflx raddr 192.168.1.248 rport 50786 generation 0 network-id 1 network-cost 10
a=candidate:62809803 1 tcp 1518280447 192.168.1.248 9 typ host tcptype active generation 0 network-id 1 network-cost 10
a=ice-ufrag:aOFc
a=ice-pwd:vlYg6zJ4hh8aD41VreHtbxRP
a=ice-options:trickle
a=fingerprint:sha-256 E3:D7:7E:B8:19:75:20:7D:8C:32:0A:F8:9E:DB:4E:05:15:9B:11:EB:F8:19:5C:BC:0D:F2:2C:25:7C:AD:7D:CD
a=setup:actpass
a=mid:0
a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level
a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time
a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01
a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid
a=sendrecv
a=msid:53ddb8f4-9d73-46fe-b3d8-d6b0b9e4654c beef31b0-11d6-4006-9e48-c8f56199cb6d
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:111 opus/48000/2
a=rtcp-fb:111 transport-cc
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:63 red/48000/2
a=fmtp:63 111/111
a=rtpmap:9 G722/8000
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:13 CN/8000
a=rtpmap:110 telephone-event/48000
a=rtpmap:126 telephone-event/8000
a=ssrc:954401866 cname:wv25JYZhqsWubI+c
a=ssrc:954401866 msid:53ddb8f4-9d73-46fe-b3d8-d6b0b9e4654c beef31b0-11d6-4006-9e48-c8f56199cb6d


10. INVITE #2 - RESPONSE PART A
SIP/2.0 100 Trying
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK1060491;received=106.222.232.145;rport=5764
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5989 INVITE
Content-Length: 0

11. INVITE #2 - RESPONSE PART B
SIP/2.0 200 OK
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK1060491;received=106.222.232.145;rport=5764
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>;tag=XtmX14caervDc
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5989 INVITE
Contact: <sip:172.23.10.251:5060;transport=tcp>
Content-Type: application/sdp
Content-Length: 637
X-Trace-ID: cddfb08c201dfcc1e4a490121ea96bb4
X-Call-Sid: 9c20caae-63d2-434b-9d2e-7575c40605bc
v=0
o=Savgw-Mediaserver 1760262422 1760262423 IN IP4 44.215.230.111
s=Savgw-Mediaserver
c=IN IP4 44.215.230.111
t=0 0
m=audio 43096 UDP/TLS/RTP/SAVPF 0 126
a=mid:0
a=rtpmap:0 PCMU/8000
a=rtpmap:126 telephone-event/8000
a=sendrecv
a=rtcp:43096
a=rtcp-mux
a=setup:active
a=fingerprint:sha-256 F1:93:BF:AF:70:F8:C1:77:76:CA:CE:8F:23:67:39:4E:11:A6:D0:61:B8:4E:E9:6C:5B:0D:95:69:19:9B:45:49
a=tls-id:26aa458911e532f8bdc198cce4e2e2a1
a=ptime:20
a=ice-ufrag:pKCEfQHj
a=ice-pwd:V5LschSQjtpLzuj42K8ZZlitlt
a=ice-options:trickle
a=candidate:1cYtUuG01OV2LrSI 1 UDP 2130706431 44.215.230.111 43096 typ host
a=end-of-candidates

12. ACK - FINAL REQUEST
ACK sip:172.23.10.251:5060;transport=tcp SIP/2.0
Via: SIP/2.0/WSS mvr5l6dlr1nj.invalid;branch=z9hG4bK6206076
Max-Forwards: 69
To: <sip:st-6716b4fb-932b-51c3-a93e-edf5eec809ad@unifiedxo-prod-savg.kore.ai>;tag=XtmX14caervDc
From: "click2call_webrtc" <sip:click2call_webrtc@unifiedxo-prod-savg.kore.ai>;tag=amdlphsg0i
Call-ID: d7a95vblrvoa68nnbnvh
CSeq: 5989 ACK
Allow: INVITE,ACK,CANCEL,BYE,UPDATE,MESSAGE,OPTIONS,REFER,INFO,NOTIFY,SUBSCRIBE
Supported: outbound
User-Agent: JsSIP 3.10.0
Content-Length: 0

13. BYE (when the user wants to disconnect the call)