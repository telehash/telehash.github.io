# `connect` - Peer Connection Request

A connect channel is only created from a [router](../routing.md) that has received and validated a [peer](peer.md) request.  The original `BODY` of the peer open is attached as the `BODY` of the `"type":"connect"` unreliable channel open packet. The original sender is included as `"peer":"uvab...hv7g"` so that the recipient can track multiple handshakes from the same source.

The recipient should parse the attached `BODY` as a packet and process it as [handshake](../e3x/handshake.md), either encrypted or unencrypted (if the sender doesn't have the recipient's keys yet).  At least one of the handshakes should be a [key](../e3x/cs/README.md#csk) to guarantee the recipient can respond.  If any of them are invalid the requests should be ignored and the channel will timeout silently.

When accepted, a [peer path](path.md) should be implicitly added to the sender's hashname via the incoming [router](../routing.md).  When the processing of the attached packet results in a response handshake, it should then be delivered via a subsequent peer request via the same [router](../routing.md).

## Automatic Bridging

When the incoming connect request has a `BODY` that is a validated handshake, the current network path it was received on should also be added as a network path to the hashname of the handshake, since the [router](../routing.md) provides automatic bridging for encrypted channel packets.
