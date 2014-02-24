# `"type":"pool"` - Tracking Resource Providers

In a distributed architecture there are frequently shared resources that are unevenly distributed, such as the [bridge](ext_bridge.md) and [buffer](ext_buffer.md) extensions. The `pool` extension is a tool that enables any switch to create and maintain an active pool of hashnames that can provide specific resources as well as help provide coordination between the resource providers.

Pools are organized by the identical Kademlia-based DHT mechanism as the core hashname routing for Telehash, such that any hashname that is a member of (providing resources for) a pool must maintain a list of buckets for the other active members of that pool.

The `peek` unreliable channel is a simple signalling for any switch to determine membership in and request more members from any pool:

```json
{
  "c":"ab945f90f08940c573c29352d767fee4",
  "type":"peek",
  "pool":"bridge"
}
```

The `pool` value must be a string, any application-defined pool names must always be prefixed with an underscore in their name (like "_namedex" for instance).

The `peek` may contain an optional `"for":"hex"` with any hex string value to provide a specific distance selector sort on the result, just like a `seek` request.  This enables any app to create their own custom DHT and do arbitrary queries against it.

A peek response is one packet identical to a `seek`:

```json
{
  "c":"ab945f90f08940c573c29352d767fee4",
  "see":[
    "c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0,184.96.145.75,59474",
    "9e5ecd193b14abaef376067f80f442be97f6f3110abb865398c2a6ec83a4ee9b"
  ],
  "end":true
}
```

The recipient returns a set of hashnames that it knows are actively a member of the specified pool (possibly including itself), sorted either by the given optional `peek` distance or by whichever members are the most stable and responsive (a quality metric).

The response addresses can then be used for the sender to initiate new connections to those hashnames to request additional members from them if it needs to "fill" it's pool or in order to maintain the pool's buckets.

A pool should be of a fixed size as set by the application (large enough to ensure adequate resources for it's purpose), and pool requests should only be made when the given pool is not full (in order to fill it) and to optionally maintain the state of the pool ensuring it has the closest ones to a `for` if used.

Pools should always be seeded by the app or included in the initial seeds information, otherwise a switch may make pool requests to every hashname it encounters in order to find an initial member.