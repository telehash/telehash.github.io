WebRTC Transport
================

When telehash is running inside a browser it is very restricted in forming direct peer-to-peer connections, but if the browser supports WebRTC it should attempt to use that as a more direct transport.

When an endpoint supports this it includes in it's `paths` a `{"type":"webrtc"}` to simply flag that it can support receiving a `"type":"webrtc"` channel.

This is currently being implemented as a test, so details are TBD.