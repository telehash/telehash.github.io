# `connect` - Peer Connection Request

A connect channel is only created from a router that has received and validated a [peer](peer.md) request.  The original `BODY` of the peer open is attached as the `BODY` of the `"type":"connect"` unreliable channel open packet.

The recipient should parse the attached `BODY` as a packet and process it as either a [handshake](../e3x/handshake.md) or the sender's [key](../e3x/cs/#packet) information.  If either of them are invalid the request should be ignored.

The result of processing the attached packet will be the sender's hashname, which must first be trusted before generating any response. If not trusted, the request should be ignored and the channel request will timeout silently.

When trusted, a [peer path](path.md) should be implicitly added to the sender's hashname via the incoming router.  When the processing of the attached packet results in a response handshake, it should then be delivered via a subsequent peer request via the same router.

## Automatic Bridging

When the incoming connect request has a `BODY` that is a validated handshake, the current network path it was received on should also be added as a network path to hashname of the handshake, since the router is providing automatic bridging for encrypted channel packets.
