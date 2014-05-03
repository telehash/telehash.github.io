# `sock` - Socket Proxy

A stream of `"type":"sock"` is a reliable channel request for the stream to become a simple raw TCP socket wrapper.  The BODY in either direction is the sequential bytes from the TCP socket.

The support and usage of this channel is application dependent, every app using a `sock` channel should have it's own validation mechanism either outside of the request (trusted hashnames), included in the initial channel request (additional JSON headers), or within the socket data itself (the BODY data has authentication).

If the application supports acting as a generic socket proxy, the `sock` channel can be used for this when the JSON accompanying a socket request contains a `"port":5667` to be proxied to localhost or an optional `"ip":1.2.3.4`.

The response to a sock can be either simple acknowldegements, additonal response BODY binary data, or at any time an `"end":true` to close the socket or `"err":"message"` to signal it errored/failed.

