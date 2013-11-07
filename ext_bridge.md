# `"type":"bridge"` - Creating alternet network paths

The bridge channel is used to enable other hashnames (either anyone, or just specific trusted ones) to use a switch as an open relay.  The supporting switch will proxy all packets from a source to a destination.

A `bridge` packet looks like:

```json
{
	"c":"ab945f90f08940c573c29352d767fee4",
	"type":"bridge",
  "in":"be22ad779a631f63336fe051d5aa2ab2",
  "out":"8b945f90f08940c573c29352d767fee4",
  "ip":"1.2.3.4",
  "port":5678,
  "rin":"60aa6514ef28178f816d701b9d81a29d",
  "rout":"69ab427ec49862739b6449e1fcd77b27"
}
```

The `in` value is the incoming line id, when any packet comes in with that id, it is swapped and replaced with the `out` value and the packet is sent to the specified ip and port.

When any line id coming into the switch matches the `rin` value, the value is changed to `rout` and it's sent to the ip/port that the bridge was created from.

This enables a supporting switch to do essentially no work in bridging packets as it can process them outside any encryption.  Swapping the line ids helps avoid external tracking.

Bridges are useful for when two switches cannot communicate directly (NATs, firewalls, different networks), as well as a general tool to obfuscate sources and destinations of traffic.