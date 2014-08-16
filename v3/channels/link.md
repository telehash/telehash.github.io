### `"type":"link"` - Enabling Discovery (DHT)

In order for any hashname to be returned in a `seek` it must have a link channel open.  This channel is the only mechanism enabling one hashname to store another in its list of [buckets](dht.md) for the DHT.  It is bi-directional, such that any hashname can request to add another to its buckets but both sides must agree/maintain that relationship.

It may pro-actively include already known nearby hashnames in a `see` value (the same address format as the `seek` response, the ",ip,port" is an optional hint) in the initial request:

```json
{
  "c":1,
  "type":"link",
  "seed":true,
  "see":["c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0,1a,184.96.145.75,59474"]
}
```

Initial response, accepting the link:

```json
{
  "c":1,
  "seed":false,
  "see":["9e5ecd193b14abaef376067f80f442be97f6f3110abb865398c2a6ec83a4ee9b,2a"]
}
```

Any see addresses should all be closer to the recipient, but if there are none then further addresses may be sent to help bootstrap enough links to form a mesh.  The `seed` value indicates wether the sender/recipient wants to act as a seed and be included in `seek` requests, otherwise it will only be included in the see response when it matches the seek exactly.

In the initial response or at any point an `end` or `err` can be sent to cancel the link, at which point both sides must remove the corresponding ones from their DHT.
