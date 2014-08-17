# Channels - Streaming Content Transport

All streaming data sent between two endpoints in an exchange must be part of a `channel` packet. Every channel has an integer id included as the `c` parameter in the JSON. See [Channel IDs](#channelids) for details on how they are selected/handled.

A channel may have only one outgoing initial packet, only one response to it, or it may be long-lived with many packets exchanged using the same "c" identifier (depending on the type of channel).  Channels are by default unreliable, they have no retransmit or ordering guarantees, and an `end` always signals the last packet for the channel with none in response.  When required, an app can also create a [reliable](reliable.md) channel that does provide ordering and retransmission functionality.

## Packet Encryption

All channel packets are encrypted using a stream cipher as determined by the [Cipher Set](cipher_sets.md) in use for the exchange.  The encrypted (OUTER) packets must have a `HEAD` of length 0 and the encrypted contents as the binary `BODY`.

Once decrypted they result in an INNER packet that must always contain valid JSON (have a `HEAD` of 7 or greater).

## Decrypted Packets


Base parameters on channel packets:

* `"type":"value"` - A channel always opens with a `type` in the first outgoing packet to distinguish to the recipient what the name/category of the channel it is. This value must only be set on the first packet, not on any subsequent ones or any responses.
* `"end":"true"` - Upon sending any content packet with an `end` of true, the sender must not send any more content packets (reliability acks/resends may still be happening though). An `end` may be sent by either side and is required to be sent by both to cleanly close a channel.
* `"err":"message"` - As soon as any packet on a channel is received with an `err` it must be immediately closed and no more packets can be sent or received at all, any/all buffered content in either direction must be dropped. These packets must contain no content other than optional extra details on the error.
* `"seq":0` - An integer sequence number that is only used for and defined by [reliable](reliable.md) channels and must be sent in the first open packet along with the `type`, it is an error to send/receive this without using reliability on both sides.

An example unreliable channel start packet JSON for a built-in channel:

```json
{
	"c":1,
	"type":path",
	"paths":[...]
}
```

An example initial reliable channel open request:

```json
{
	"c":2,
  "seq":0,
	"type":"hello",
	"hello":{"custom":"values"}
}
```

<a name="channelid" />
### Channel IDs

A Channel ID is a *positive* integer (uint32_t) from 1 to 4,294,967,295 and is determined by the sender and then used by both sides to send/receive packets on that channel.  In order to prevent two endpoints from picking the same `c` value they choose them based on their [order](order.md): the `HIGH` endpoint uses odd numbers starting with 1, and the `LOW` endpoint uses even numbers starting with 2. 0 is never a valid ID.

When a new channel is created, the ID must be higher than the last one the initiator used, they must always increment. Upon receiving a new channel request, the recipient must validate that it is higher than the last active channel (note: switches must still allow for two new channel requests to arrive out of order).

When a new exchange is established, it errors any already confirmed opened channels and sets the minimum required incoming channel IDs back to being greater than 0.
