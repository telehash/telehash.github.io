# Box - Offline Signalling (Store-and-Forward)

> This is a **rough draft** and a work in progress

The box channel is used to asynchronously send and receive encrypted [messages](../e3x/messages.md) directly or via any shared hashname that is acting as a cache/router.  A caching entity can be selected automatically based on capacity/availability or chosen specifically based on app configuration.

The use of remote entities to provide caching should be considered carefully and minimized, they must be trusted to not collect metadata about the status and volume of signalling between any hashnames using them, as well as to not archive the encrypted payloads for future analysis.  When providing caching for other hashnames, the existence of and contents of all boxes must never be stored at rest and only kept in dynamic memory.

## Box IDs

A `box` always has a consistent unique ID that is the [SipHash](http://en.wikipedia.org/wiki/SipHash) of the recipient hashname (32 bytes) using the first half of the sender hashname (16 bytes) as the key.  The resulting 64-bit hash output is always hex encoded as a string when used in JSON: `"box":"851042800434dd49"` 

## Advertising Capacity/Status

Box status is advertised during any [handshake](../e3x/handshake.md) as a message using a "box" type:

```
{
  "type": "box",
  "quota": [used, capacity]
}
BODY: id1, id2, id3
```

The BODY is the list of binary 64-bit box IDs with messages waiting, only the first 120 IDs are included, any additional are truncated and must be retrieved dynamiclly by the recipient.

The quota is an array of two unsigned integers where the first number is how many total waiting messages there are for the recipient, and the second is how many messages the sender is willing to cache for the recipient.

No additional data is returned (such as size of each box, timestamps, or sorting) in order to minimize the metadata the sender is required to maintain.

## Channel Flow

The box channel is always reliable and client-server oriented (not bi-directional, one could be open in both directions) where the initial open request is sent by the client and the recipient is the server managing the box.

When a box channel is opened by a sender to a recipient it uses the format:

```json
{
  "c":1,
  "seq":1,
  "type":"box",
  "to":"uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g"
}
```

The server calculates the box ID based on the recipient and sender, and must never return an `err` based on any internal status of the given box or recipient so as to not reveal any metadata or relationship.  If there is not capacity for the recipient the server must just accept and acknowledge all messages but not cache them.

Packets may contain an optional `"x":3600` specifying the number of seconds to cache a message, the server is not required to support or enforce this, it is just a signal to help optimize cache management.

A recipient opens a box channel to receive any waiting messages with the format:

```json
{
  "c":1,
  "seq":1,
  "type":"box",
  "box":"851042800434dd49"
}
```

If the `"box"` is not included it is a request for the next available box with any ID, and the selected box key/value is sent in a single response packet.  Any given ID must be validated as being to the recipient.

Upon opening, all waiting messages for the client are streamed back (flow is managed normally as a reliable channel).  If there are no messages or the box is unknown the channel is always closed by the server without an error.

Any packet on the channel can contain a message attached as the BODY in either direction, and each message must never be larger than 1024 bytes.  All messages are uniquely identified/cached by the SipHash of the BODY using the box ID as the key so that the server can easily dedup messages. If the box is at capacity, older messages are automaticlly removed when new ones are sent. The server should always retain at least one message for any sender regardless of age up to the total capacity of messages (quota of 100 would be at most 1 message per 100 senders).

A packet with a `"id":"16-hex"` only and no BODY from either the sender or recipient is a request to clear/remove any matching message in the box.

Any packet from the client may contain a `"clear":true` which empties all of the messages in the box before processing any attached BODY.
