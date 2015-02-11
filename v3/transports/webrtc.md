WebRTC Transport
================

> This is currently being implemented experimentally at [telehash-webrtc](https://github.com/quartzjer/telehash-webrtc)

When telehash is running inside a browser it is very restricted in forming direct peer-to-peer connections, but if the browser supports WebRTC it should attempt to use that as a more direct transport.

When an endpoint supports this it includes in it's `paths` a `{"type":"webrtc"}` to simply flag that it can support receiving a `"type":"webrtc"` channel that will serve as the WebRTC signalling delivery.  The channel is unreliable and a new one is opened/sent for every signal event, with the signal attached as `"signal":{...}` in the JSON.

All packets must be [cloaked](../e3x/cloaking.md) and are sent as base64 encoded message events over a data channel.


