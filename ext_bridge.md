# `"type":"bridge"` - Creating alternet network paths

The bridge channel is used to enable other hashnames (either anyone, or just specific trusted ones) to proxy the traffic for a single line through the hosting switch when the two parties of the line cannot communicate directly (NATs, firewalls, different network types, etc).  The supporting switch will receive the line packets and immediately send them all to a different destination instead of processing them.

A `bridge` packet looks like:

```json
{
	"c":"ab945f90f08940c573c29352d767fee4",
	"type":"bridge",
  "to":"be22ad779a631f63336fe051d5aa2ab2",
  "path":{"type":"ipv4", "ip":"1.2.3.4", "port":5678},
  "from":"69ab427ec49862739b6449e1fcd77b27"
}
```

The `to` value is the incoming line id, when any packet comes in with that id the packet is sent to the specified `path` (same format as `alts` entries).  It is the responsibility of the bridge creator to ensure the path is valid, as the bridge will provide no feedback as to status.

When any line id coming into the switch matches the `from` value it's resent to the network path that the bridge was created from.  Bridges should be persisted until the hashname that created it goes offline.

This enables a supporting switch to do essentially no work in bridging packets as it can process them outside any encryption.  To prevent any loops, a cache of recently used `iv` values on the bridge packets should be kept and any repeat ones should be dropped.

## Bridge Suggestion

When a hashname that is receiving a `peer` and sending out a `connect` recognizes that neither the sender or recipient has a public network path (ipv4 or ipv6), it may include a `"bridge":{"type":"foo","id":"bar"}` that specifies a path that it can be sent in a `bridge` request to create one to the sender of the peer.  Otherwise, the two may have no way of connecting directly outside of a `relay` temporarily.