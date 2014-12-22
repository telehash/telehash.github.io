# `peer` - Routing Request

Any endpoint can request another to act as a router to an endpoint it is attempting to link with.  These routing requests are sent in a `"type":"peer"` unreliable channel.  A peer request is typically generated as the result of having a [peer path](path.md) for any endpoint.

A peer open request requires a `"peer":"fvifxlr3bsaan2jajo5qqn4au5ldy2ypiweazmuwjtgtg43tirkq"` where the value is the hashname the sender is trying to reach. The `BODY` of the open request must contain an attached packet with information for the specified peer to qualify the original sender.  The `BODY` will be relayed by the routing endpoint.

The recipient of the peer request is called the `router` and must qualify the specified `peer` value to make sure that it is able to establish a channel with it.  It must also ensure that either the sender or peer endpoints have an active link and are trusted to provide routing for.

Once validated, the router relay's the original `BODY` in a [connect](connect.md) request to the peer.

No response is ever given to the `peer` channel, it should not error based on any validation so that the requesting endpoint cannot determine any information about the state of the peer.  The channel should silently timeout and clean up.

```json
{
  "c":10,
  "type":"peer",
  "peer":"fvifxlr3bsaan2jajo5qqn4au5ldy2ypiweazmuwjtgtg43tirkq"
}
BODY: ...packet...
```

## First Introductions

The first time an endpoint is attempting a link with a new peer it may not have any information other than it's hashname, so it cannot send encrypted handshakes.  Instead, it must attach a BODY with the sending endpoint's key information in [packet format](../e3x/cs/#packet).  If the sender doesn't know the correct `CSID` it should open multiple peer channels, one with each key it supports.

The router may ignore attached keys that it knows to be an invalid `CSID` for the peer.

## Automatic Bridging

When the `BODY` contains a [handshake](../e3x/handshake.md) packet, the router should determine the routing `token` value of the handshake and create a mapping of that token to the network path that the peer request arrived via.  Any subsequent encrypted channel packets received with this token should be re-delivered to that network path, providing automatic bridging.

## Sessions

If a peer is willing to be a router for another peer to other unknown hashnames, it may generate a unique [URI](../uri.md) including an opaque `session` value and send it as a [handshake](../e3x/handshake.md) to that peer.  When the unknown hashname sends the router a handshake it must include the URI so that the router can validate the `session` and accept correct `peer` requests from them.  When the new hashname generates the `peer` open it must aslso include the given `"uri":"..."` so that it can be re-verified by both the router and destination peer.

