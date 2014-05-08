# Messages - Asynchronous Communication

> This is a **rough draft** and a work in progress

A `message` is a single packet encrypted between two hashnames identically to an `open` as defined by their common [Cipher Set](cipher_sets.md).  The `line key` used to encrypt the open is ephemeral, generated for each message and must only be used once.

Messages are:

* created specifically for a resolved hashname (must have it's CSID)
* never larger than 1024 bytes after encryption
* innner/unencrypted packet capacity varies by Cipher Set
* inner packet is not defined, usage depends on context
* always sent/received over a "box" channel

Messages are primarily useful when two hashnames need to exchange data and are not online at the same time and applications should be designed to minimize the amount of data required to be sent via messages.

Box status is advertised in any link channel by using a `"box":[boxes,capacity]` where the first number is how many boxes have waiting messages for the recipient, and the second is how many messages the sender is willing to store for the recipient.

A box channel is always opened for a specific hashname (which can be the senders or recipients too, it addresses a box) and is client-server oriented (not bi-directional, one could be open in both directions).  Upon opening, any waiting messages are sent.

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

Any packet on the channel can contain a message attached as the BODY in either direction.  All messages are uniquely identified by a 32-byte value that is either specified as an optional `"key":"hex"` or defaults to the SHA-256 of the message (but may be different if provided).  If the box is at capacity, older messages are automaticlly removed when new ones are sent.

Packets from the server are messages waiting for the client hashname and will remain stored until they are removed.  Packets from the client containing messages should be stored in the given box, and may contain an optional `"expire":3600` specifying the number of seconds to store the message.  Servers should store messages until they reach a configured capacity, at which point they should remove the oldest.

A packet with a `"key":"hex"` only and no BODY is a request to clear/remove any matching message in the box.

Any packet from the client may contain a `"clear":true` which empties all of the messages in the box before processing any attached message.
