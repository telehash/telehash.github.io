# Box - Offline Signalling (Store-and-Forward)

The box channel is used to asynchronously send and receive encrypted [messages](../e3x/messages.md) directly or via any shared hashname that is acting as a cache/router.  A caching entity can be selected automatically based on capacity/availability or chosen specifically based on app configuration.

The use of remote entities to provide caching should be considered carefully and minimized, they must be trusted to not collect metadata about the status and volume of signalling between any hashnames using them, as well as to not archive the encrypted payloads for future analysis.  When providing caching for other hashnames, the existence of and contents of all boxes must never be stored at rest and only kept in dynamic memory.

Boxes are always one direction only, from a sender to a cache to a recipient or directly from a sender to a recipient.  No status or state is returned to the sender, it is the responsibility of the recipient only to share any message state.

## Box IDs

A `box` always has a consistent unique binary 8-byte ID that is the [SipHash](http://en.wikipedia.org/wiki/SipHash) output of the recipient hashname (32 bytes) using the first half of the sender hashname (16 bytes) as the key. 

All box IDs will be consistent between a sender/recipient pair regardless of the identity of any caching party.

## Message IDs

Every message has a unique ID within a box that is the SipHash of the message bytes with the box ID doubled to make 16 byte key.

All message IDs will be unique to a box and sender/recipient pair, always consistent regardless of the source/delivery of the message.

## Advertising Status - `boxes`

Box status is advertised as an unreliable channel of type `boxes` always opened to the recipient.  Any endpoint that has cached messages should automatically initiate this channel to indicate status to the recipient, typically when an exchange is first [synchronized](../e3x/handshake.md) but also whenever an empty box has a message added.

```
{
  "type": "boxes",
}
BODY: id1, id2, id3
```

The BODY is the list of binary 8-byte box IDs with messages waiting, only up to 120 IDs are included per message and any additional are sent in the next message on the channel, ending the channel with the last one.

No additional data is returned (such as size of each box, timestamps, original hashname, or sorting) in order to minimize the metadata the sender is required to maintain.

## Sending - `outbox`

The `outbox` channel is always reliable and initiated by the sender to a caching server or directly to the recipient.

```json
{
  "c":1,
  "seq":1,
  "type":"outbox",
  "to":"uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g"
}
```

The box ID is always calculated based on the `to` recipient and the hashname of the sender.  Messages are attached as the BODY and concatenated until a packet contains a `"done":true`, at which point that message ID is calculated and it is processed.

The done packet may contain an optional `"x":3600` specifying the number of seconds to cache a message, the server is not required to support or enforce this, it is just a signal to help optimize cache management.

A packet with a `"id":"16-hex"` only and no BODY at any point is a request to clear/remove any cached messages with that ID.  A packet with a `"clear":true` at any point will clear all currently cached messages in the box or any messages in progress on the channel, and any BODY is the start of a new message.

If the box is at capacity, older messages are automaticlly removed when new ones are sent. The server should attempt to retain the last message from any sender if it is <1024 bytes regardless of age (quota of 10k would be at most 1 message per 10 senders).

Handling a box channel must never return an `err` based on any internal status of the given box or recipient so as to not reveal any metadata or relationship.  If there is not capacity for the recipient the server must just accept and acknowledge all messages but not cache them.

## Receiving - `inbox`

A recipient opens an `inbox` channel to receive any waiting messages with the format:

```json
{
  "c":1,
  "seq":1,
  "type":"inbox",
  "box":"851042800434dd49"
}
```

The box ID is the hex encoding of the 8-byte value from the `boxes` channel. Upon opening, all waiting messages for the recipient are streamed back (flow is managed normally as a reliable channel).  

Every packet sent back will contain message bytes as the BODY, if the message is larger than one channel packet it is broken across multiple with the last packet always containing a `"done":true`.  

Once all messages are sent, or when there are no messages or the box is unknown, the server must send a packet that contains a `"cap":1234` of an unsigned integer to indicate the number of bytes of message data it will cache for the given box ID.

Identically to the `outbox` channel, any packet sent back with an `"id":"16-hex"` only is a request to clear/remove any matching message in the box, and a `"clear":true` immediately empties all of the messages in the box regardless of status.  The server will always respond with an updated `cap` value.
