# `"type":"bridge"` - Creating alternet network paths

The bridge channel is used to enable other hashnames (either anyone, or just specific trusted ones) to use a switch as an open relay when they cannot communicate directly (NATs, firewalls, different network types, etc).  The supporting switch will proxy all packets from a source to a destination.

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
