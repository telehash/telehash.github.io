Reliable Channels
=================

Channel packets are by default only as reliable as the underlying transport itself is, which often means they may be dropped or arrive out of order.  Most of the time applications want to transfer content in a durable way, so reliable channels replicate TCP features such as ordering, retransmission, and buffering/backpressure mechanisms. The primary method of any application interfacing with an e3x library is going to be through starting or receiving reliable channels.

Reliability is requested on a channel with the very first packet (that contains the `type`) by including a `"seq":1` with it, and a recipient must respond with an `err` if it cannot handle reliable channels.  Reliability must not be requested for channel types that are expected to be unreliable.

## `seq` - Sequenced Data

The requirement for a reliable channel is always including a simple incrementing `"seq":1` positive integer value on every packet that contains any content (including the `end`). All `seq` values start at 1 with the open and increment per packet sent when it contains any data to be processed, with a maximum value of 4,294,967,295 (a 32-bit unsigned integer)

A buffer of these packets must be kept keyed by the seq value until the recipient has responded
confirming them in a `ack` (below). The maximum size of this buffer and the number of outgoing packets that can be sent before being acknowledged is currently 100, this static limit is just temporary to ease early implementations and dynamic windowing will be defined using special `miss` values.

Upon receiving `seq` values, the recipient must only process the packets and their contents in order, so any packets received with a sequence value out of order or with any gaps must either be buffered or dropped.  It is much more efficient to buffer these when a sender has the resources to do so, but if buffering it must have it's own internal maximum to limit it.

## `ack` - Acknowledgements

The `"ack":1` integer is included on outgoing packets as the highest known `seq` value confirmed as *delivered to the app* (as much as is possible). What this means is that any library must provide a way to send data/packets to the app using it in a serialized way, and be told when the app is done processing one packet so that it can both confirm that `seq` as well as give the app the next one in order. Any outgoing `ack` must be the last processed `seq` so that the sender can confirm that the data was completely received/handled by the recipient.

If a received packet contains a `seq` but does not contain an `ack` then the recipient is not required to send one for the given `seq` while it's still processing packets for up to one second.  This allows senders to manage their outgoing buffer of packets and the rate of ack's being returned, and ensures that an `ack` will still be sent at a regular rate based on what is actually received.

An `ack` may also be sent in it's own packet ad-hoc at any point without any content data, and these ad-hoc acks must not include a `seq` value as they are not part of the content stream and are out-of-band.

When receiving an `ack` the recipient may then discard any buffered packets up to and including that matching `seq` id, and also confirm to the app that the included content data was received and processed by the other side.


## `miss` - Missing Sequences

The `"miss":[1,2,4]` is an array of positive delta integers and must be sent along with any `ack` if in the process of receiving packets there are missing sequences. The array entries each represent a `seq` value calculated as the delta from the previous entry, using the accompanying `ack` as the initial base to start calculating from.

The last entry in the array always represents the `seq` id that the recipient will start dropping packets at, it is the maximum capacity of the incoming unprocessed packet buffer.  Whenever the buffer is over 50% full the recipient should send a `miss` to indicate the capacity left even if there are no other missing packets.  When the sender gets a `miss` it should always cache the total delta number as the maximum window size and never send packets with a higher `seq` than the last received `ack`+delta.

Upon receiving a `miss` the recipient should resend those specific matching calculated `seq` id packets in it's buffer, but never more than once per second. If the missing `seq` is signalled in multiple incoming packets quickly (happens often), the matching packet should only be resent once until at least one second has passed.

The `miss` recipient can make no assumptions about the sender's state of any `seq` ids higher than the `ack` and not included in the array, it can only use the values included as a signal for them alone.

### `miss` delta encoding example

Given the raw list of missing `seq` ids `[78236, 78235, 78245, 78238]` and `"ack": 78231`.

1. Sort the original list of missing seq ids:<br/>
   `[78235, 78236, 78238, 78245]`
2. Calculate the difference between all subsequent ids (including the `ack`).<br/>
   `[(78235 - 78231), (78236 - 78235), (78238 - 78236), (78245 - 78238)]`<br/>
   `[4, 1, 2, 7]`
3. If the incoming max buffer size is 20 packets, append the highest acceptable seq (`78251`) as a final delta (`78251 - 78245`).<br/>
   `[4, 1, 2, 7, 6]`
3. Deliver the final delta encoded `miss` array.

