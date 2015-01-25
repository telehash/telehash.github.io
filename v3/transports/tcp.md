TCP Transport
=============

See [chunking](../lob/chunking.md) for how to encode one or more packets on a standard TCP socket.  All packets must be [cloaked](../e3x/cloaking.md).

## Timeout

A new keepalive handshake may be automatically triggered when no packets have been sent for 5 minutes as an extra validation that the TCP socket is still connected.

