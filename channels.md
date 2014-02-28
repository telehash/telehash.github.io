## Channels - Content Transport

All data sent between any two hashnames (inside a line packet) must be part of a `channel`. Every channel has an integer id included as the `c` parameter in the JSON. See [Channel IDs](#channelids) for details on how they are selected/handled.

A channel may have only one outgoing initial packet, only one response to it, or it may be long-lived with many packets exchanged using the same "c" identifier (depending on the type of channel).  Channels are by default unreliable, they have no retransmit or ordering guarantees, and an `end` always signals the last packet for the channel with none in response.  When required, an app can also create a [reliable](reliable.md) channel that does provide ordering and retransmission functionality.

Base parameters on channel packets:

* `"type":"value"` - A channel always begins with a `type` in the first outgoing packet to distinguish to the recipient what the name/category of the channel it is. This value must only be set on the first packet, not on any subsequent ones or any responses. Application-defined custom types must always be prefixed with an underscore, such as "_chat".
* `"end":"true"` - Upon processing any content packet with an `end` of true, the recipient must not send any more content packets (reliability acks/resends may still be happening though) or expect anymore to be received and consider the channel closed. An `end` may be sent by either side and is not required to be sent by both.
* `"err":"message"` - As soon as any packet on a channel is received with an `err` it must be immediately closed and no more packets can be sent or received at all, any/all buffered content in either direction must be dropped. These packets must contain no content other than optional extra details on the error.
* `"_":{...}` - For any application-defined channels that have an underscore-prefixed type, any JSON values provided by or for the application are sent in the `_` key value.
* `"seq":0` - An integer sequence number that is only used for and defined by [reliable](reliable.md) channels, it is an error to send/receive this without using reliability on both sides.

An example unreliable channel start packet JSON for a built-in channel:

```json
{
	"c":1,
	"type":"seek",
	"seek":"67a42f01"
}
```

An example initial reliable channel request from an app:

```json
{
	"c":2,
  "seq":0,
	"type":"_hello",
	"_":{"custom":"values"}
}
```

<a name="channelid" />
### Channel IDs

A Channel ID is a positive (unsigned) integer and is determined by the sender and then used by both sides to send/receive packets on that channel.  In order to prevent two hashnames from picking the same `c` value they both use a simple rule when they initiate a new channel: sort both hashnames alphabetically and the lower/first sorted one uses only even numbers, while the higher/second one uses odd numbers.

When a new channel is created, the ID must be higher than the last one the initiator used, they must always increment. Upon receiving a new channel request, the recipient must validate that it is higher than the last active channel (note: switches must still allow for two new channel requests to arrive out of order).

When a new [line](network.md#line) is estblished, it resets any stored channel state and sets the minimum required channel IDs back to 0.
