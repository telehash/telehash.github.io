# WebRTC Paths

When telehash is running inside a browser it is very restricted in forming direct peer-to-peer connections, but if the browser supports WebRTC it can use that as an alternative.

When a switch supports this it includes in it's `paths` a `{"type":"webrtc","id":"..."}` to simply flag that it can support receiving a `"type":"webrtc"` channel and what channel id to use for it.

This is currently being implemented as a test, so details are TBD.