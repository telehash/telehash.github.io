# `"type":"pool"` - Tracking Resource Providers

In a distributed architecture there are frequently shared resources that are unevenly distributed, such as the [bridge](ext_bridge.md) and [buffer](ext_buffer.md) extensions. The `pool` extension is a tool that enables any switch to create and maintain an active pool of hashnames that can provide each resource.

The `pool` unreliable channel is a simple signalling channel for any switch to determine membership in and request more members from any pool:

```json
{
	"c":"ab945f90f08940c573c29352d767fee4",
	"type":"pool",
  "pool":["bridge", "buffer", "_namedex"]
}
```

And a response of one or more packets like:

```json
{
	"c":"ab945f90f08940c573c29352d767fee4",
  "pools":{
    "bridge":['c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0,184.96.145.75,59474',
     '9e5ecd193b14abaef376067f80f442be97f6f3110abb865398c2a6ec83a4ee9b,184.96.145.75,56674'],
    "buffer":[],
    "_namedex":["8f83606d57ab52161aec9868725d53f2054d9ae16a91274ffcb20a68a15c0855,184.96.145.75,42424"]
  },
  "end":true
}
```

If the recipient is not a member of the pool it can either return an empty array or simply not include that key in the return object. Any application-defined pools must always be prefixed with an underscore in their name.

The recipient should return the closest addresses to the sender (up to 5) that they are actively connected to and have as members in the given pool.

The response addresses can then be used for the sender to initiate new connections to those hashnames if it needs to "fill" it's pool.

A pool should be of a fixed size as set by the application (large enough to ensure adequate resources for it's purpose), and pool requests should only be made when the given pool is not full in order to fill it.

Pools should always be seeded by the app or included in the initial seeds information, otherwise a switch may make pool requests to every hashname it encounters in order to find an initial member.