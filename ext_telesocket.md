# TeleSocket (TS)- WebSockets over Telehash

The WebSocket definition is a simple connection abstraction layer defining minimal "open", "close", "error", and "message" events to/from a URI.

Any switch can support this same abstraction using the URI structure of `ts://c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0/pathname` where the protocol is `ts` for TeleSocket, the host part is the target hashname, and the given path (defaults to `/` if none specified) as a selection mechanism.

The reliable channel type used to create a TS is just `ts` and the only required key is `"path":"/"` containing the pathname part of the URI:

```json
{
  "c":"ab945f90f08940c573c29352d767fee4",
  "type":"ts",
  "path":"/",
  "seq":0
}
```

If the receiving hashname supports TS on the given path, it responds with:

```json
{
  "c":"ab945f90f08940c573c29352d767fee4",
  "open":true,
  "seq":0,
  "ack":0
}
```

And then both sides fire the `onopen` event to the app.  Otherwise on any error, the sender fires an `onerror`.  Upon receiving an `"end":true` the recipient fires an `onclose`.

## Interface

The primary interface for creating or listening to a TS should be via the app passing in a URI and optional callback to the switch.  If the URI is to another hashname it should create a immediately return a socket with a `send(data)` and `close()` interface that will also receive the `onopen`, `onerror`, `onclose`, and `onmessage` (or `onmessageack`) events when they occur on that socket.  If the URI is to it's own hashname or is only the pathname component ("/" or "/foo", etc), it must also include a callback that is passed an incoming socket object whenever a pathname-matching incoming `ts` is accepted.

When the app on either side calls the `send(data)` method on the socket, that data is sent out over one or more packets as the BODY (up to 1k of data per packet), and when the final packet contains the end of the passed in data a `"done":true` is included on that packet.  When receiving packets on this channel any switch should append and buffer any BODY until it receives a done flag on that packet, and then pass the buffered data to the app via an `onmessage` event.

If the app supports receiving acknowledge messages, it can alternatively fire an `onmessageack` event with the data and a callback function so that the switch only sends an `ack` of that last packet once the app has confirmed it processed the message via the callback.

