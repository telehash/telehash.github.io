## Built-In Channels

The following values for `type` are for unreliable channels that are used by switches to provide and maintain connectivity between instances. They are part of the core spec, and must be implemented internally by all switches:

  * [`seek`](#seek) - given a hashname, return any pointers to other hashnames closer to it (DHT)
  * [`link`](#link) - request/enable another hashname to return the other in a `seek` request (DHT)
  * [`peer`](#peer) - ask the recipient to make an introduction to one of it's peers
  * [`connect`](#connect) - a request asking to try to open a connection to a given hashname (result of a `peer`)
  * [`relay`](#relay) - the capability for a switch to help two peers exchange connectivity information
  * [`path`](#path) - how two switches prioritize and monitor network path information


<a name="seek" />
### `"type":"seek"` - Finding Hashnames (DHT)

The core of Telehash is a basic Kademlia-based DHT, the bulk of the logic is in the rules around maintaining a mesh of lines and calculating distance explained [here](kademlia.md). When one hashname wants to connect to another, it recursively sends `seek` requests to find closer and closer peers until it's discovered or there are none closer. The seek request contains a `"seek":"hex-value"` that is always a prefix of the hashname that it is trying to connect to.

When initating a new connection, the first seek requests should always be sent to the closest hashnames with active [links](#link).  Then the switch recursively sends seeks to the closest hashnames to the target until it discovers it or cannot find any closer.  It is suggested that this recursive seeking process should have at least three threads running in parallel to optmize for non-responsive nodes and round-trip time.  If no closer nodes are being discovered, the connection process should fail after the 9 closest nodes have been queried or timed-out.

Only the prefix hex value is sent in each seek request to reduce the amount of information being shared about who's seeking who. The value then is only the bytes of the hashname being saught that match the distance to the recipient plus one more byte in order for the recipient to determine closer hashnames.  So if a seek is being sent to  "1700b2d3081151021b4338294c9cec4bf84a2c8bdf651ebaa976df8cff18075c" for the hashname "171042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6" the value would be `"seek":"1710"`.

The response is a compact `"see":[...]` array of addresses that are closest to the hash value (based on the [kademlia][] rules).  The addresses are a compound comma-delimited string containing the "hash,cs,ip,port" (these are intentionally not JSON as the verbosity is not helpful here), for example "1700b2d3081151021b4338294c9cec4bf84a2c8bdf651ebaa976df8cff18075c,1a,123.45.67.89,10111". The "cs" is the [Cipher Set][] ID and is required. The ip and port parts are optional and only act as hints for NAT hole punching.

Only hashnames with an active `link` may be returned in the `see` response, and it must always include an `"end":true`.  Only other seeds will be returned unless the seek hashname matches exactly, then it will also be included in the response even if it isn't seeding.

<a name="link" />
### `"type":"link"` - Enabling Discovery (DHT)

In order for any hashname to be returned in a `seek` it must have a link channel open.  This channel is the only mechanism enabling one hashname to store another in it's list of [buckets](kademlia.md) for the DHT.  It is bi-directional, such that any hashname can request to add another to it's buckets but both sides must agree/maintain that relationship.

The initial request:

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

The `see` value is the same format as the `seek` response and pro-actively sends other seeds to help both sides establish a full mesh.  The see addresses should all be closer to the recipient, but if there are none then further addresses may be sent to help bootstrap.  The `seed` value indicates wether the sender/recipient wants to act as a seed and be included in `seek` requests, otherwise it will only be included in the see response when it matches the seek exactly.

In the initial response or at any point an `end` or `err` can be sent to cancel the link, at which point both sides must remove the corresponding ones from their DHT.

The link channel requires a keepalive at least once a minute in both directions, and after two minutes of no incoming activity it is considered errored and cancelled.  When one side sends the keepalive, the other should immediately respond with one to keep the link alive as often only one side is maintaining the link.  Links initiated without seeding must be maintained by the requestor.

The keepalive requires only the single key/value of `"seed":true` or `"seed":false` to be included to indicate it's seeding status. This keepalive timing is primarily due to the prevalance of NATs with 60 second activity timeouts, but it also serves to keep only responsive hashnames returned for the DHT.

Details describing the distance logic, maintenance, and limits can be found in [DHT](dht.md) reference.

<a name="peer" />
### `"type":"peer"` - Introductions to new hashnames

For any hashname to send an open to another it must first have one of it's public keys, so all new opens must be "introduced" via an existing line. This introduction is a two step process starting with a peer request to an intermediary. Since new hashnames are discovered only from another one in the `see` values, the one returning the see is tracked as a "via" so that they can be sent a `peer` request when a connection is being made to a hashname they sent. This also serves as a workaround if any NAT exists, so that the two hashnames can send a packet to each other to make sure the path between them is open, this is called "hole punching." 

A peer request requires a `"peer":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"` where the value is the hashname the sender is trying to reach. The BODY of the peer request must contain the binary public key of the sender, whichever key is the highest matching [Cipher Set][] as signalled in the original `see`.  The recipient of the peer request must then send a connect (below) to the target hashname (that it already must have an open line to).

These requests are always sent with a `"end":true` and no response is generated.

If a sender has multiple known public network paths back to it, it should include an [paths](#paths) array with those paths, such as when it has a valid public ipv6 address.  Any internal paths (local area network addresses) must not be included in a peer request, only known public address information can be sent here.  Internal paths must only be sent in a [path](#path) request since that is private over a line and not exposed to any third party (like the peer/connect flow is).

<a name="connect" />
### `"type":"connect"` - Connect to a hashname

The connect request is an immediate result of a `peer` request and must always attach/forward the same original BODY it as well as a [paths](#paths) array identifying possible network paths to it.  It must also attach a `"from":{...}` that is the [Cipher Set][] keys of the peer sender, identical format as to what is sent as part of an `open`.

The recipient can use the given public key to send an open request to the target via the possible paths.  If a NAT is suspected to exist, the target should have already sent a packet to ensure their side has a path mapped through the NAT and the open should then make it through.

When generating a connect, the switch must always verify the sending path is included in the paths array, and if not insert it in. This ensures that the recipient has at least one valid path, and when there were others it included it speeds up path discovery since no additional [`path`](#path) round trip such as for an IPv6 one.

When there's multiple paths the processing of them must only send an open per *type* to prevent spamming of fake entries triggering unsolicited outgoing packets.  For "ipv4" and "ipv6" there may be two of each sent, one for a public IP and one for a private IP of each type.  Also to minimize unsolicited opens, no more than one connect per second should be processed for a given hashname.

These requests are also sent with a `"end":true` and no response is generated.

<a name="relay" />
### `"type":"relay"` - Guaranteed Connectivity

There are a number of situations where two different hashnames will be unable to connect directly to each other, and while these are not very common, the protocol must ensure that any two hashnames have the ability to securely exchange information.

The two most common cases are with combinations of certain NATs where at least one dynamically maps external ports such that the sending hashname has no way to detect it (often called symmetric NATs), and the other is when two hashnames are on the same local network and their shared NAT doesn't allow them to send public data to each other. Typical solutions in other protocols involve using a shared/trusted third party to relay the data via (TURN), and exchanging internal network addresses via a third party. There are additional cases that will become more common in the future as well, such as when there are diverse networks and two hashnames are on different ones entirely (one is ip based and the other bluetooth) connected only by a hashname that handles both.

When a hashname detects that it cannot connect directly with another (there are different detection techniques for the various cases), it sends a `peer` that also includes a relay path in the [paths](#paths) array. Upon receiving a `connect` with the relay path in it, that hashname must additionally open a `relay` channel and send the identical `open` packet over the relay as well as sending it to the included ip/port info in the connect. If the relay is the only connectivity established, the subsequent `line` packets may be sent over it.

A `relay` channel is very simple, every packet must contain a `"to":"..."` of the hashname to relay to, and that hashname must be one that the receiving switch already has an open line to.  Each packet must also contain the `"type":"relay"` such that the sending/receiving switches don't need to maintain state and every packet can be processed alone. The relay packets are then sent as-is over the line to the recipient, and any/all packets sent from either side are then relay'd as-is to the other. The channel is unreliable and the relayed packets must not contain any reliability information.

To prevent abuse, all switches must limit the volume of relay packets from any hashname to no more than five per second.  Any packets over that rate MUST be dropped/discarded. This is a fast enough rate for any two hashnames to negotiate additional connectivity (like using a [ext_bridge][]) and do basic DHT queries.

Switches must also prevent double-relaying, sending packets coming in via a relay outgoing via another relay, a relay is only a one-hop utility and two hashnames must negotiate alternate paths for additional needs. Any `peer` requests coming in via a relay must also not have a relay included in their paths.

<a name="path" />
### `"type":"path"` - Network Path Information

Any switch may have multiple network interfaces, such as on a mobile device both cellular and wifi may be available simutaneously or be transitioning between them, and for a local network there may be a public IP via the gateway/NAT and an internal LAN IP. A switch should always try to discover and be aware of all of the networks it has available to send on (ipv4 and ipv6 for instance), as well as what network paths exist between it and any other hashname. 
 
An unreliable channel of `"type":"path"` is the mechanism used to discover, share, prioritize and test any/all network paths available.  For each known/discovered network path to another hashname a `path` is sent over that network interface including an optional `"priority":1` (any positive integer, defaults to 0) representing it's preference for that network to be the default.  The responding hashname upon receiving any `path` must return a packet with `"end":true` and include an optional `"priority":1` with it's own priority for that network interface is to receive packets via.

Every path request/response must also contain a `"path":{...}` where the value is the specific path information this request is being sent to. The sending switch may also time the response speed and use that to break a tie when there are multiple paths with the same priority.

A switch should send path requests to it's seeds whenever it comes online or detects that it's local network information has changed in order to discover it's current public IP/Port from the response `path` value in case it's behind a NAT.

Additional path requests only need to be sent when a switch detects more than one (potential) network path between itself and another hashname, such as when it's public IP changes (moving from wifi to cellular), when line packets come in from different IP/Ports, when it has two network interfaces itself, etc.  The sending and return of priority information will help reset which paths are then used by default.

A [paths](#paths) array should be sent with every new path channel containing all of the sender's paths that they would like the recipient to use. Upon receiving a path request containing an `paths`, the array should be processed to look for new/unknown possible paths and those should individually be sent a new path request in return to validate and send any priority information.

#### Path Detection / Handling

There are two states of network paths, `possible` and `established`.  A possible path is one that is suggested from an incoming `connect` or one that is listed in an `paths` array, as the switch only knows the network information from another source than that network interface itself.  Possible paths should only be used once on request and not trusted as a valid destination for a hashname beyond that.

An established path is one that comes from the network interface, the actual encoded details of the sender information.  When any `open` or `line` is received from any network, the sender's path is considerd established and should be stored by the switch as such so that it can be used as a validated destination for any outgoing packets.  When a switch detects that a path may not be working, it may also redundantly send the hashname packets on any other established path.

