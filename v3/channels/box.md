# Box - Sending/Receiving Messages (direct or DHT)

> This is a **rough draft** and a work in progress

The box channel is used to send and receive [messages](../e3x/messages.md) directly or from any third party hashname that is acting as a cache.  The caching hosts can be selected automatically based on DHT proximity or chosen specifically based on the application's design (fixed servers, known/elected peers, etc).

A box channel is always opened for a specific hashname.  The given "box" hashname combined with the sender is the unique identity of the box. The channel is client-server oriented (not bi-directional, one could be open in both directions) where the initial request is sent by the client and the recipient is the server.  Upon opening, any waiting messages for the client are sent.

Box status is advertised in any link channel by using a `"box":[boxes,capacity]` where the first number is how many boxes have waiting messages for the recipient, and the second is how many messages the sender is willing to store for the recipient.

The channel is started with:

```json
{
  "c":1,
  "seq":0,
  "type":"box",
  "box":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6",
  "csid":"1a"
}
BODY: client's 1a public key
```

If the "csid" key is not included it is a request for the server to send the given box hashname's parts and key in the response.

The server responds with a `"cap":10` number for the available capacity of the box to store new messages.  If no "box" is given on the request, the server picks the oldest box with messages waiting and sends a "box" in the response along with a `"parts":{...}` and the attached csid key so that the recipient can process the messages if they haven't seen that hashname yet.

Any packet on the channel can contain a message attached as the BODY in either direction, and each message must never be larger than 1024 bytes.  All messages are uniquely identified by a 32-byte value that is either specified as an optional `"key":"hex"` or defaults to the SHA-256 of the message (but may be different if provided).  If the box is at capacity, older messages are automaticlly removed when new ones are sent.

Packets from the server are messages waiting for the client hashname and will remain stored until they are removed.  Packets from the client containing messages should be stored in the given box, and may contain an optional `"expire":3600` specifying the number of seconds to store the message.  Servers should store messages until they reach a configured capacity, at which point they should remove the oldest.

A packet with a `"key":"hex"` only and no BODY is a request to clear/remove any matching message in the box.

Any packet from the client may contain a `"clear":true` which empties all of the messages in the box before processing any attached message.
