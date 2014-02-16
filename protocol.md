Telehash protocol draft
=================

# Introduction

> Editorial Note: This is the second major version of the Telehash protocol, the
> first one is deprecated and was a minimal experimental spec 
> to create a distributed hash table.  This is a work in progress yet
> and starting to stabilize.  This intro/overview will likely soon be broken 
> out into it's own document separate from the protocol details.

Telehash is a new secure wire protocol that creates a decentralized overlay network, enabling apps and devices to
find, identify, and communicate directly with each other.  It is built
on public-key security (PKI) and fundamentally creates mesh of peer-to-peer
(P2P) connections using a distributed hash-table (DHT).

The principle idea that drove the creation and development of Telehash
is the belief that any application instance should be able to easily and
securely talk to any other application instance or device, whether they are two
instances of the same application, or completely different
applications. They should be able to do so directly, and in any
environment, from servers to mobile devices down to embedded systems
and sensors.

By enabling this freedom for developers as a foundation for their
applications, Telehash enables the same freedom for the people using
them - that the user can connect, share, and communicate more easily
and with control of their privacy.

The challenges and complexity today in connecting applications via
existing technologies such as APIs, OAuth, and REST is only increasing,
often forcing fundamentally insecure, centralized, and closed/gated
communication platforms.  By adopting Telehash in any application, that
application immediately has a powerful set of open tools for not only
its own needs, but can then also enable connectivity to and from
applications created by others easily. These tools include the ability
to have friends, sharing, feeds, tagging, search, notifications,
discovery, and other social patterns.

Telehash has a fundamental requirement to remain simple and
light-weight in order to support applications running on networked
devices and sensors. The design goals also include not forcing any
particular architectural design such as client-server,
centralized/federated/distributed, polling/push, REST, streaming,
publish-subscribe, or message passing... any can be used, as Telehash
simply facilitates secure reliable connectivity between any two or more
applications in any networking environment.

## Parallels

Since Telehash is it's own networking stack layered above existing networks, it has mechanisms that parallel well known Internet ones and is easy to draw an analogy to:

* `IP` - Addressing in Telehash is based on a fingerprint of a public key generated locally by an app (called a `hashname`) instead of a centrally assigned number.
* `Routing` - Hashnames are organized into a DHT that every peer helps maintain, there are no core routers or managed backbone.
* `SSL` - Every hashname is it's own cryptographic identity, there are no central certificate authorites and all communications are always encrypted via a `line`.
* `TCP/UDP` - Any two hashnames can create one or more channels between them to transfer content, each channel can either be reliable (everything is ordered/confirmed) or unreliable (lossy).


## Security

The goal of Telehash isn't to invent new kinds of security, it's to simply use the best of existing solutions and apply them to a long-term decentralied system.  There isn't any single standard that can be adopted as-is for this type of usage, so the approach is to use and evolve sets of well known ciphers and algorithms with as minimal adaptation as is possible.

There are three different security aspects within the protocol, one for addressing validation, one for forward secrecy, and one for packet encryption.  There are no new algorithms being created, only existing crypto libraries/systems are used for each of those three different aspects as defined in [Cipher Sets][].

# Protocol Details

## Glossary

  * **DHT**: Distributed Hash Table (based on [Kademlia][])
  * **NAT**: A device/router that acts as a bridge to internal IPPs
    (Network Address Translation)
  * **Hashname**: The unique address of an individual application/instance
    using Telehash, a 64 character hex string
  * **Packet**: A single message containing JSON and/or binary data sent between any two
    hashnames
  * **Switch**: The name of the software layer or service parsing
    packets for one or more hashnames
  * **Line**: When any two hashnames connect and exchange their identity
    to form a temporary encrypted session (like a VPN tunnel between
    them)
  * **Channels**: Dynamic bi-directional transport that can transfer
    reliable/ordered or lossy binary/JSON mixed content within any line
  * **Seed**: A hashname that is acting as a seed for the DHT and will respond to search and introduction requests

## Telehash Switches

In order to use Telehash in an application, the application will need
to include a software layer that talks to the Internet and processes
Telehash packets, known as a "switch".

It is highly recommended to use an existing switch library or service
for your environment, rather than creating one from scratch. This will
help insure that the security, identity, and networking aspects are
verified properly. If there isn't one which meets your needs, then we
would love your help - pull requests to list them here are welcome!

* Node.js - [node-telehash](https://github.com/telehash/node-telehash)
* D - [telehash.d](https://github.com/temas/telehash.d)
* Python - [plinth](https://github.com/telehash/plinth)
* Javascript (browser) [thjs](http://github.com/telehash/thjs)
* C [telehash-c](http://github.com/quartzjer/telehash-c)
* Ruby - [ruby-telehash](https://github.com/telehash/ruby-telehash)
* Go - [gogotelehash](https://github.com/telehash/gogotelehash)
* Java - [telehash-java](https://github.com/kubes/telehash-java)
* ObjectiveC - [Objective-Telehash](https://github.com/jsmecham/Objective-Telehash)
* PHP - [SwitchBox](https://github.com/jaytaph/switchbox)
* Erlang - [relish](https://github.com/telehash/relish)

## Creating Applications

In addition to using a switch library, each instance of an application must generate
its own unique address as a set of cryptographic keys.  These keys are used to locate and verify other instances of the application on the network.

An application must also bundle and optionally provide a mechanism to
retrieve a list of "seeds" - well-known and accessible DHT members.
This will be used to bootstrap and connect into the DHT the first time. The entries in
this list will consist minimally of the public keys and network addresses of each seed. This format is described more in the [Seeds JSON](seeds.md).

## Hashnames
Every instance of an application has a unique public address that is called
its `hashname`. Any application instance can use the DHT to find
others by knowing only their hashname. By default there is a single global
DHT to support this discovery and connectivity, but Telehash also supports applications creating their own private
DHTs for other uses.

The hashname is a 64-character lower case hex string, formed by the [SHA-256][] digest of the fingerprints of a set of public keys that is generated the first time an application starts, an example hashname is `2dbf1ce81180d9ed9258e3e8729ba642c8ab2a31268d31cd2c7ffe8693e3a02e`.

The details of how the hashname is calculated from the generated keys is described in the [Cipher Sets](cipher_sets.md#hashnames) document.

## Packets

A packet uses JSON as a core extensible and widely supported data format, but also support raw binary data transfer for efficiency.

Every packet must begin with two bytes which form a network byte-order
short unsigned integer. This integer represents the length in bytes of
the UTF-8 encoded JSON object which follows it. The JSON portion of the
packet is optional, so the length may be from zero up to the length of the packet minus two (for the length bytes).

Any remaining bytes on the packet after the JSON are considered raw binary and
referenced as the 'BODY' when used in definitions below.

The format is thus:

    <length><JSON>[BODY]

A simplified example of how to decode a packet, written in Node.js:

``` js
dgram.createSocket("udp4", function(msg){
    var length = msg.readUInt16BE(0);
    var js = JSON.parse(msg.toString("utf8", 2, length + 2));
    var body = msg.slice(length + 2);
});
```

Packet size is determined by the MTU of the network path between any two instances, and in general any sent over the Internet using UDP can safely be up to 1472 bytes max size (1500 ethernet MTU minus UDP overhead).  There are plans to add MTU size detection capabilities, but they are not standardized yet.  In most cases a switch will handle any data fragmentation/composition so that an application doesn't need to be aware of the actual packet/payload sizes in use.

### JSON

The JSON section of a packet often acts as a header of a binary payload.
The fields used vary depending on the context and are specified below,
but all packets sent over the network contain a `type` field with a string value.

### BODY

The optional BODY is always a raw binary of the remainder bytes between
the packet's total length and that of the JSON as indicated by LENGTH
above. Often a BODY is another full raw packet and will be decoded
identically to being read from the network, this pattern of one
packet enclosing/attaching another is how the [Cipher Sets][] encrypt data.

The BODY is also used as the raw (optionally binary) content transport
for channels and for any app-specific usage.

<a name="paths" />
### Network Paths

To enable the most direct P2P connectivity possible the default network transport between any two switches is UDP.  Additional transports are defined below for when UDP is not supported or as a fallback if it's blocked.  All UDP packets map 1:1 to a Telehash packet.

Every unique network sender/recipient is called a `path` and defined by a JSON object that contains a `"type":"..."` to identify which type of network information it describes. The current path types defined are:

* `ipv4` - UDP, contains `ip` and `port`, default and most common path
* `ipv6` - UDP, contains `ip` and `port`, preferred/upgraded when both sides support it
* `http` - see [path_http][], also is the primary fallback when UDP is blocked
* `webrtc` - see [path_webrtc][], preferred when possible
* `relay` - contains `id` of the channel id to create a [relay](#relay) with
* `bridge` - see [ext_bridge][], fallback when no other path works

These paths are used often within the protocol to exchange network information, and frequently sent as an array, for example:

```js
[{
  "type": "ipv4",
  "ip": "127.0.0.1",
  "port": 42424
}, {
  "type": "ipv6",
  "ip": "fe80::2a37:37ff:fe02:3c22",
  "port": 42424
}, {
  "type": "http",
  "http": "http://127.0.0.1"
}]
```

## Packet types
When a packet is being processed from the network initially, it's
JSON must contain a `type` field with a string value of `open` or
`line`, each of which determine how to process the BODY of the packet:

 * [`open`](#open) - this is a request to establish a new encrypted session
 * [`line`](#line) - this is an encrypted packet for an already established session

<a name="open" />
### `open` - Establishing a Line

A packet of `"type":"open"` is used to establish a temporary encrypted
session between any two hashnames, this session is called a "line". You must know a public key of the recipient in order to send an `open` packet to them. The detailed requirements to create/process open packets are defined by the [Cipher Set](cipher_sets.md) being used between two hashnames.

The BODY of the open packet will be a binary encrypted blob, once decrypted by the process defined in the Cipher Set that is being used, it will contain another "inner" packet. Here's an example of the JSON content of this inner packet before encryption:

```js
{
    "from":{"2a":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"},
    "at":1375983687346,
    "line":"8b945f90f08940c573c29352d767fee4"
}
```

The inner packet's required values are defined as:

   * `from` - the fingerprints of the public keys defining the sending hashname, called it's `parts`
   * `line` - the unique id the recipient must use for sending any line packets, 16 random bytes lower case hex encoded
   * `at` - an integer timestamp of when the line was initiated, used to verify another incoming open request is newer based on the last received `at`

The inner packet must also contain a BODY that is the binary `key` for the Cipher Set being used.

An `open` is always triggered by the creation of a channel to a hashname, such that when a channel generates it's first packet the switch recognizes that a line doesn't exist yet.  The initiating channel logic is internally responsible for any retransmission of it's own packets, and those retransmissions are the source of re-triggering the sending of any `open` requests.

When a new line is initiated the switch must also store a local timestamp at that time and send that same value as the `at` in any subsequent open request for that line.  This enables the recipient to recognize retransmissions of the same line initiation request, as well as detect when an open is generated for a new line as it will have a newer `at` value relative to the existing one. Any subsequent opens with matching or older `at` values must be ignored.

A switch may have an existing line but believe that the recipient might not have the line open anymore (such as if it reset, has been idle more than 60 seconds, or there's a new incoming `connect` from the other hashname, etc). In this state it should re-send the same open packet for the current line again, allowing the recipient to re-open the line if so.

If a new open request is validated and there's an existing line, when the new open contains a new `line` id then the recipient must reset all existing channels and any session state for that hashname as it signifies a complete reset/restart.  If the new open contains the same/existing line id as a previous one, it is simply a request to recalculate the line encryption keys but not reset any existing channel state.

<a name="line" />
### `line` - Packet Encryption

As soon as any two hashnames have both send and received a valid `open` then a line is created between them. Since one part is always the initiator and sent the open as a result of needing to create a channel to the other hashname, immediately upon creating a `line` that initiator will then send line packets.

Every `"type":"line"` packet is required to have a `line` parameter that matches the outgoing id sent in the open, unknown line ids are ignored/dropped.  The BODY is always an encrypted binary that is defined by the encryption/decryption used in the given [Cipher Set](cipher_sets.md).

Once decrypted, the resulting value is a packet that must minimally contain a "c" value as defined below to identify the channel the packet belongs to.

<a name="channels" />
## Channels - Content Transport

All data sent between any two hashnames (inside a line packet) must be part of a `channel`. Every channel has an integer id included as the `c` parameter in the JSON. See [Channel IDs](#channelids) for details on how they are selected/handled.

A channel may have only one outgoing initial packet, only one response to it, or it may be long-lived with many packets exchanged using the same "c" identifier (depending on the type of channel).  Channels are by default unreliable, they have no retransmit or ordering guarantees, and an `end` always signals the last packet for the channel with none in response.  When required, an app can also create a [reliable](reliable.md) channel that does provide ordering and retransmission functionality.

Base parameters on channel packets:

* `"type":"value"` - A channel always begins with a `type` in the first outgoing packet to distinguish to the recipient what the name/category of the channel it is. This value must only be set on the first packet, not on any subsequent ones or any responses. Application-defined custom types must always be prefixed with an underscore, such as "_chat".
* `"end":"true"` - Upon processing any content packet with an `end` of true, the recipient must not send any more content packets (reliability acks/resends may still be happening though) or expect anymore to be received and consider the channel closed. An `end` may be sent by either side and is not required to be sent by both.
* `"err":"message"` - As soon as any packet on a channel is received with an `err` it must be immediately closed and no more packets can be sent or received at all, any/all buffered content in either direction must be dropped. These packets must contain no content other than optional extra details on the error.
* `"_":{...}` - For any application-defined channels that have an underscore-prefixed type, any JSON values provided by or for the application are sent in the `_` key value.
* `"seq":0` - An integer sequence number that is only used for and defined by [reliable](reliable.md) channels, it is an error to send/receive this without using reliability on both sides.

An example unreliable channel start packet JSON for a built-in channel:

```json
{
	"c":1,
	"type":"seek",
	"seek":"67a42f01"
}
```

An example initial reliable channel request from an app:

```json
{
	"c":2,
  "seq":0,
	"type":"_hello",
	"_":{"custom":"values"}
}
```

<a name="channelid" />
### Channel IDs

A Channel ID is a positive (unsigned) integer and is determined by the sender and then used by both sides to send/receive packets on that channel.  In order to prevent two hashnames from picking the same `c` value they both use a simple rule when they initiate a new channel: sort both hashnames alphabetically and the lower/first sorted one uses only even numbers, while the higher/second one uses odd numbers.

When a new channel is created, the ID must be higher than the last one the initiator used, they must always increment. Upon receiving a new channel request, the recipient must validate that it is higher than the last active channel (note: switches must still allow for two new channel requests to arrive out of order).

When a new [line](#line) is estblished, it resets any stored channel state and sets the minimum required channel IDs back to 0.

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

The response is a compact `"see":[...]` array of addresses that are closest to the hash value (based on the [kademlia][] rules).  The addresses are a compound comma-delimited string containing the "hash,cs,ip,port" (these are intentionally not JSON as the verbosity is not helpful here), for example "1700b2d3081151021b4338294c9cec4bf84a2c8bdf651ebaa976df8cff18075c,1,123.45.67.89,10111". The "cs" is the [Cipher Set][] numeric ID and is required. The ip and port parts are optional and only act as hints for NAT hole punching.

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
  "see":["c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0,1,184.96.145.75,59474"]
}
```

Initial response, accepting the link:

```json
{
  "c":1,
  "seed":false,
  "see":["9e5ecd193b14abaef376067f80f442be97f6f3110abb865398c2a6ec83a4ee9b,2"]
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


[sha-256]: https://en.wikipedia.org/wiki/SHA-2
[sockets]: ext_sockets.md
[tickets]: ext_tickets.md
[ext_bridge]: ext_bridge.md
[kademlia]: dht.md
[path_webrtc]: path_webrtc.md
[path_http]: path_http.md
[cipher sets]: cipher_sets.md
[cipher set]: cipher_sets.md
