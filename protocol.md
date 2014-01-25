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

The goal of Telehash isn't to invent new kinds of security, it's to simply use the best of existing solutions and apply them to a long-term decentralied system.  There isn't any existing security standard that can be adopted as-is for this type of usage, so the approach is to use and evolve sets of well known ciphers and algorithms with as minimal adaptation as is possible.

There is a conscious choice to use three different techniques within the protcol, one for addressing validation, one for forward secrecy, and one for packet encryption.  There is no new crypto being invented as part of the protocol, existing libraries/systems are used for each of those three different aspects.

# Protocol Details

## Glossary

  * **DHT**: Distributed Hash Table (based on [Kademlia][])
  * **NAT**: A device/router that acts as a bridge to internal IPPs
    (Network Address Translation)
  * **Hashname**: The unique address of an individual application/instance
    using Telehash
  * **Packet**: A single message containing JSON and/or binary data sent between any two
    hashnames
  * **Switch**: The name of the software layer or service parsing
    packets for one or more hashnames
  * **Line**: When any two hashnames connect and exchange their identity
    to form a temporary encrypted session (like a VPN tunnel between
    them)
  * **Channels**: Dynamic bi-directional transport that can transfer
    reliable/ordered or lossy binary/JSON mixed content within any line

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

In addition to a switch, each instance of an application must generate
its own unique, private RSA keypair. This keypair is used to used to
identify and each application instance when communicating with other
applications.

An application must also bundle and optionally provide a mechanism to
retrieve a list of "seeds" - well-known and accessible DHT members.
This will be used to bootstrap and connect into the DHT. The entries in
this list will consist minimally of the public key, IP address and port
of each seed.

## Hashnames
Every instance of an application has a unique public id that is called
its "hashname". Any application instance can use the DHT to find
others by knowing their hashname. By default there is a single global
DHT, but Telehash also supports applications creating their own private
DHTs if needed.

The hashname, which identifies an endpoint within Telehash, is a
64-character hex string, formed by the [SHA-256][] digest of the `keys`. The keys are the fingerprints of the one or more public keys that are used to create a new hashname. Each key has a unique numeric identifier and a string fingerprint value as defined in [Cipher Sets][].  The hashname is the digest of the key values concatenated in descending order.

Here's an example of how to create a hashname using Node.js:

``` js
var keys = {"1":"bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe","0":"861b9311b1ad8ec9ae810f454745d37b46355604637e068cea6a8131191b7d4f"};
var sorted = Object.keys(keys).sort(function(a,b){return b-a});
var values = sorted.map(function(key){return keys[key.toString()]});
var hashname = require("crypto").createHash("sha256").update(values.join("")).digest('hex');
```

## Packets

Packets are a foundational piece of the protocol. A packet uses JSON as
a core extensible and widely supported data format, but also must
support binary data transfer for efficiency.

Every packet must begin with two bytes which form a network byte-order
short unsigned integer. This integer represents the length in bytes of
the UTF-8 encoded JSON object which follows it. The JSON portion of the
packet is optional, so the length may be from zero up to the length of the packet minus two (for the length bytes).

Any remaining bytes on the packet after the JSON are considered raw binary and
referenced as the 'BODY' when used in definitions below.

The format is thus:

    <length><JSON>[BODY]

An example of how to decode a packet, written in Node.js:

``` js
dgram.createSocket("udp4", function(msg){
    var length = msg.readUInt16BE(0);
    var js = JSON.parse(msg.toString("utf8", 2, length + 2));
    var body = msg.slice(length + 2);
});
```

Packets sent over the Internet should be less than 1472 bytes max size (1500 ethernet MTU minus UDP overhead) unless there is prior knowledge that larger ones will work (MTU detection, alternet/direct network types, etc).

### JSON

The JSON section of a packet often acts as a header of a binary payload.
The fields used vary depending on the context and are specified below,
but all top-level packets contain a `type` field with a string value.

### BODY

The optional BODY is always a raw binary of the remainder bytes between
the packet's total length and that of the JSON as indicated by LENGTH
above. Often a BODY is another full raw packet and will be decoded
identically to being read from the UDP socket, this pattern of one
packet enclosing/attaching another is how the RSA signatures and
encryption are implemented.

The BODY is also used as the raw (optionally binary) content transport
for channels and for any app-specific usage.

### Packet Processing

The Telehash specification as well as other applications may use
packets recursively, by embedding the (possibly encrypted) byte
representation of an inner packet into the BODY of an outer one. As a
result, switch implementations must be prepared to decode packets not
just from UDP messagess, but from a BODY or after decryption.


## Packet types
When a packet is being processed from a UDP message initially, it's
JSON must contain a `type` field with a string value of `open` or
`line`, each of which determine how to process the BODY of the packet:

 * [`open`](#open) - this is a request to establish a new encrypted
   session (a `line`) and contains the data to do so
 * [`line`](#line) - this is an encrypted packet for an already
   established session

Once a line is established, all packets sent thereafter within a line
must be part of a [channel](#channel) as the content-transport method
between any two hashnames.

<a name="open" />
### `open` - Establishing a Line

A packet of `"type":"open"` is used to establish a temporary encrypted
session between any two hashnames, this session is called a "line". You
must know the RSA public key of the recipient in order to send an
`open` message to them.

Every open packet requires the additional JSON keys of `open`, `iv`,
and `sig`, here's an example of the JSON part of the packet:

```js
{
    "type":"open",
    "open":"ZkQklgyD91XQaih07VBUGeQmAM9tnR5qMGMavZ9TNqQMCVfTW8TxDr9y37cgB8g6r9dngWLjXuRKe+nYNAG/1ZU4XK+GiR2vUBS8VTcAMzBcUls+GIfZU6WO/zEIu4ra1I1vI8qnYY5MqS/FQ/kMXk9RyzERaD38IWZLk3DYhn8VYPnVnQX62mE5u20usMWQt99F8ITLy972nOhdx5y9RUnnSrtc1SD9xr8O0rco22NtOEWC3uAISwC9xuihT+U7OEcvSKolScFI4oSpRu+DQWl19EAuG9ACqhs5+X3qNeBRMSH8w5+ThOVHaAWKGfFs/FNMdAte3ki8rFesMtfhXQ==",
    "iv":"60aa6514ef28178f816d701b9d81a29d",
    "sig":"o6buYor8o3YXkPIDJjufn9udfWDJt5hrgnVtKtvZI2ObOPlPSqlb2AdH6QsC7CuwtboGlt6eMbE7Ep6Js2CXeksXTCSZOJ99US7TH0kZ1H1aDqxYpQlM6BADOjG6YOcW+EhniotNUBiw3r02Xt4ohSm0wXxQ97JM95ntFBRnWr1vG25d+5pJQE4LyN2TwB4uApu9zeUoTPhF7daJQOcIMn9en+XxyuBsG61oR/x29bpaoZJGnKrk2DGH1jDnI5GpxIKUbT/Pa7QOlrICUCjGDgxy2TMQ+fiip5sIflxtFUPM/BV9mh4K7/ZaekJXTFfG2FKvJFytQkWbisDVy5EbEA=="
}
```

The required values of the open packet are defined as:

   * `open` - a base64 string value that is is created by generating a
     new elliptic (ECC) public key and using RSA to encrypt it *to* the
	 recipient's RSA public key. The ECC keypair should be generated
	 using the P-256 ([nistp256/secp256r/X9.62 prime256v1] 
	 (http://tools.ietf.org/html/rfc6239#page-4)) curve. The key
     should be in the uncompressed form, 65 bytes (ANSI X9.63 format). The RSA encryption
     should use PKCS1 OAEP (v2) padding.
   * `iv` - 16 random bytes hex encoded to be used as an initialization
     vector
   * `sig` - a string created by first using the sender's RSA public key
     to sign (SHA256 hash and PKCS1 v1.5 padding) the attached
     (encrypted) binary body, then encrypt that signature (detailed below), then base64 encoded.

The BODY of the open packet will be a binary encrypted blob containing
another packet. The encryption is done using AES-256-CTR using the IV
value above. The AES key is formed by doing a SHA-256 hash of the ECC
public key in uncompressed form. 

Here's an example of the JSON content of this inner packet before
encryption:

```js
{
    "to":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6",
    "at":1375983687346,
    "line":"8b945f90f08940c573c29352d767fee4"
}
```

The inner packet's required values are defined as:

   * `to` - which hashname this line is being created to
   * `line` - the unique id the recipient must use for sending any line
     packets, 16 random bytes hex encoded
   * `at` - an integer timestamp of when it was sent, used to verify another incoming open request is newer

This inner packet holds the sender's RSA public key as the BODY
attachment, in binary DER format.


#### Retransmission

An `open` is always triggered by the creation of a channel to a hashname, such that when a channel generates it's first packet the switch recognizes that a line doesn't exist yet and attempts to create one.  This usually also requires some `seek` requests to find the target hashname and then `peer` to request a connection.  The initiating channel logic is internally responsible for any retransmission of it's own packets, and those retransmissions are the source of re-triggering the sending of any `peer` and/or `open` requests.

When a line is being created the switch generates it's temporary ECC key for the line and must also store it's local timestamp of when it created the ECC key to send that timestamp value as the `at` in any open request.  This enables the recipient to recognize retransmissions of the same line initiation request, as well as detect when an open is generated for a new line as it will have a newer `at` value than the existing one.

<a name="line" />
### `line` - Packet Encryption

As soon as any two hashnames have both send and received a valid `open` then a line is created between them. Since one part is always the initiator and sent the open as a result of needing to create a channel to the other hashname, immediately upon creating a `line` that initiator will then send line packets.

The encryption key for a line is defined as the SHA 256 digest of the ECDH shared secret (32 bytes) + outgoing line id (16 bytes) + incoming line id (16 bytes).  The decryption key is the same process, but with the outgoing/incoming line ids reversed.

A packet with a `"type":"line"` is required to have a `line` parameter (such as
`"line":"be22ad779a631f63336fe051d5aa2ab2"`) with the value being the
same as the one the recipient sent in its `open` packet, and a random
IV value (such as `"iv":"8b945f90f08940c573c29352d767fee4"`) used for
the AES encryption.  This ensures that no line packets can be received
without being invited in an open. Any unknown ones are just ignored.

The BODY is a binary encoded encrypted packet using AES-256-CTR with
the encryption key that was generated for the line (above) and the 16-byte initialization
vector decoded from the included "iv" hex value.  Once decrypted (using the twin generated decryption key), the
recipient then processes it as a normal packet (LENGTH/JSON/BODY) from
the sending hashname.  All decrypted packets must contain a "c"
value as defined below to identify the channel they belong to (below).

<a name="channel" />
### `channel` - Content Transport

All data sent between any two hashnames (inside a line packet) must
contain a `c` parameter with a unique value (16 random bytes hex
encoded) determined by the sender for each channel.

A channel may have only one outgoing initial packet, only one response to it, or it may be long-lived with many packets exchanged using the same "c" identifier (depending on the type of channel).

Key parameters channel packets:

* `"type":"value"` - A channel always begins with a `type` in the first outgoing packet to distinguish to the recipient what kind of channel it is. This value must only be set on the first packet, not on any subsequent ones or any responses. Application-defined custom types must always be prefixed with an underscore, such as "_chat".
* `"end":"true"` - Upon processing a packet with an `end`, the recipient must not send any more content packets (reliability acks/resends may still be happening though) or expect anymore to be received and consider the channel closed. An `end` may be sent by either side and is not required to be sent by both.
* `"err":"message"` - As soon as any packet on a channel is received with an `err` it must be immediately closed and no more packets can be sent or received at all, any/all buffered content in either direction must be dropped. These packets must contain no content other than optional extra details on the error.
* `"_":{...}` - For any application-defined channels that have an underscore-prefixed type, any JSON values provided by or for the application are sent in the `_` key value.


<a name="unreliable" />
#### Unreliable Channels

An unreliable channel has no retransmit or ordering guarantees, and an `end` always signals the last packet for the channel with none in response. Any channel that is unreliable must not include any `seq` value (reliability signal below) in the initial `type` packet, and if one is received it must respond with an `err`.   Unreliable channels are also often referred to as "lossy" and "raw" as they provide no guarantees and switches may expose them in a very minimal interface.

The following values for `type` are for unreliable channels that are used to locate and communicate with
application instances on the DHT. They are part of the core spec, and must be implemented internally by all switches:

  * [`seek`](#seek) - return any pointers to other closer hashnames for the given `hash` (DHT), answer contains `see`
  * [`peer`](#peer) - ask the recipient to make an introduction to one of it's peers
  * [`connect`](#connect) - a request asking to try to open a connection to a given hashname (result of a `peer`)
  * [`relay`](#relay) - the capability for a switch to help two peers exchange connectivity information
  * [`path`](#path) - how two switches prioritize and monitor network path information

An example unreliable channel start packet JSON for an app:

```json
{
	"c":"ab945f90f08940c573c29352d767fee4",
	"type":"_hello",
	"_":{"custom":"values"}
}
```


<a name="reliable" />
#### Reliable Channels

Telehash packets are by default only as reliable as UDP itself is, which means they may be dropped or arrive out of order.  Most of the time applications want to transfer content in a durable way, so reliable channels replicate TCP features such as ordering, retransmission, and buffering/backpressure mechanisms. The primary method of any application interfacing with a switch library is going to be through starting or receiving reliable channels.

Reliability is requested on a channel with the very first packet (that contains the `type`) by including a `"seq":0` with it, and a switch must respond with an `err` if it cannot handle reliable channels.  Reliability must not be requested for channel types that are expected to be unreliable (like `seek` and `peer`, etc).

##### `seq` - Sequenced Data

The principle requirement of a reliable channel is always including a simple `"seq":0` integer value on every packet that contains any content (including the `end`). All `seq` values start at 0 and increment per packet sent when that packet contains any data to be processed.

A buffer of these packets must be kept keyed by the seq value until the receiving switch has responded
confirming them in a `ack` (below). The maximum size of this buffer and the number of outgoing packets that can be sent before being acknowledged is currently 100, but this is very much just temporary to ease early implementations and handling it's size will be defined in it's own document.

Upon receiving `seq` values, the switch must only process the packets and their contents in order, so any packets received with a sequence value out of order or with any gaps must either be buffered or dropped.  It is much more efficient to buffer these when a switch has the resources to do so, but if buffering it must have it's own internal maximum to limit it.

##### `ack` - Acknowledgements

The `"ack":0` integer is always included on any outgoing packets as the highest known `seq` value confirmed as *processed by the app*. What this means is that any switch library must provide a way to send data/packets to the app using it in a serialized way, and be told when the app is done processing one packet so that it can both confirm that `seq` as well as give the app the next one in order. Any outgoing `ack` must represent only the latest app-processed data `seq` so that the sender can confirm that the data was completely received/handled by the recipient app.

An `ack` may also be sent in it's own packet ad-hoc at any point without any content data, and these ad-hoc acks must not include a `seq` value as they are not part of the content stream.

When receiving an `ack` the switch may then discard any buffered packets up to and including that matching `seq` id, and also confirm to the app that the included content data was received and processed by the other side.

An `ack` must be sent a minimum of once per second after receiving any packet including a `seq` value, either included with response content packets or their own ad-hoc packets.  Allowing up to one second gives a safe default for the application to generate any response content, as well as receive a larger number of content packets before acknowleding them all.

##### `miss` - Misssing Sequences

The `"miss":[1,2,4]` is an array of integers and must be sent along with any `ack` if in the process of receiving packets there were any missing sequences, containing in any order the known missing sequence values.  Because the `ack` is confirmed processed packets, all of the `miss` ids will be higher than the accompanying `ack`.

This is only applicable when a receiving switch is buffering incoming sequences and is missing specific packets in the buffer that it requires before it can continue processing the content in them.

A `miss` should be no larger than 100 entries, any array larger than that should be discarded, as well as any included sequence values lower than the accompanying `ack` or higher than any outgoing sent `seq` values.

Upon receiving a `miss` the switch should resend those specific matching `seq` packets in it's buffer, but never more than once per second. So if an id in a `miss` is repeated or shows up in multiple incoming packets quickly (happens often), the matching packet is only resent once until at least one second has passed.

A switch MAY opportunistically remove packets from it's outgoing buffer that are higher than the `ack` and lower than the highest value in a `miss` array, and are not included in the array as that's a signal that they've been received.

##### Reliability Notes

Here's some summary notes for implementors:

* send an ack with every outgoing packet, of the highest seq you've received and processed
* only send a miss if you've discovered missing packets in the incoming seq ordering/buffering
* if an app is receiving packets and hasn't generated response packets, send an ack after 1s
* when an `end` is sent, don't close the channel until it's acked
* when an `end` is received, process it in order like any other content packet, and close only after acking + timeout wait to allow re-acking if needed
* automatically resend the last-sent un-acked sequence packet every 2 seconds until the channel timeout

<a name="seek" />
### `"type":"seek"` - Finding Hashnames (DHT)

The core of Telehash is a basic Kademlia-based DHT. The bulk of the complexity is in the rules around maintaining a mesh of lines and calculating distance explained [below](#kademlia). The `"seek":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"` value is always another hashname that the app is trying to connect to.

When one hashname wants to connect to another hashname, it finds the closest lines it knows and sends a `seek` containing the hash value to them.  They return a compact `"see":[...]` array of addresses that are closest to the hash value.  The addresses are a compound comma-delimited string containing the "hash,ip,port" (these are intentionally not JSON as the verbosity is not helpful here), for example "1700b2d3081151021b4338294c9cec4bf84a2c8bdf651ebaa976df8cff18075c,123.45.67.89,10111".

The response `see` packet must always include an `"end":true`.

<a name="peer" />
### `"type":"peer"` - Introductions to new hashnames

For any hashname to send an open to another it must first have it's hashname, so there is a two step process starting with a peer request. Since new hashnames are discovered only from another (in the `see` values), they are tracked as a "via" so that they can be sent a peer request when a connection is being made to a hashname they sent.

This also serves as a workaround if any NAT exists, so that the two hashnames can send a packet to each other to make sure the path between them is open, this is called "hole punching." A peer request requires a `"peer":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"` where the value is the hashname the sender is trying to reach. The recipient of the peer request must then send a connect (below) to the target hashname (that it already must have an open line to).

These requests are always sent with a `"end":true` and no response is generated.

If a sender has multiple known public network paths back to it, it should include an [paths](#paths) array with those paths, such as when it has a valid public ipv6 address.  Any internal paths (local area network addresses) must not be included in a peer request, only known public address information can be sent here.  Internal paths must only be sent in a [path](#path) request since that is private over a line and not exposed to any third party (like the peer/connect flow is).

<a name="connect" />
### `"type":"connect"` - Connect to a hashname

The connect request is an immediate result of a peer request and must always contain a BODY of their public key as well as a [paths](#paths) array identifying possible network paths to it.

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
### `"type":"path"` - Network Path Prioritization

Any switch may have multiple network interfaces, such as on a mobile device both cellular and wifi may be available simutaneously or be transitioning between them, and for a local network there may be a public IP via the gateway/NAT and an internal LAN IP. A switch should always try to be aware of all of the networks it has available to send on (ipv4 and ipv6 for instance), as well as what network paths exist between it and any other hashname. 
 
An unreliable channel of `"type":"path"` is the mechanism used to prioritize and test when there are multiple network paths available.  For each known/discovered network path to another hashname a `path` is sent over that network interface including an optional `"priority":1` (any positive integer, defaults to 0) representing it's preference for that network to be the default.  The responding hashname upon receiving any `path` must return a packet with `"end":true` and include an optional `"priority":1` with it's own priority for that network interface is to receive packets via.

The sending switch may also time the response speed and use that to break a tie when there are multiple paths with the same priority.

A switch only needs to send a `path` automatically when it detects more than one (potential) network path between itself and another hashname, such as when it's public IP changes (moving from wifi to cellular), when line packets come in from different IP/Ports, when it has two network interfaces itself, etc.  The sending and return of priority information will help reset which networks are then used by default.

<a name="paths" />
### `"paths":[...]` - Network Path List

Any `peer`, `connect`, or `path` packet may also contain a `"paths":[{"type":"ipv4","ip":1.2.3.4,"port":5678},...]` array of objects each of which contains information about a possible network path.  This array is used whenever the sender has additional networks that it would like the recipient to try using.

Each paths object must contain a `"type":"..."` to identify which type of network information it describes. Current types of paths defined:

* `ipv4` - contains `ip` and `port` (typically the LAN values)
* `ipv6` - contains `ip` and `port` (to enable the recipient to ugprade if supported)
* `relay` - contains `id` of the channel id to create a relay with
* `bridge` - see [ext_bridge][]
* `webrtc` - see [path_webrtc][]
* `http` - see [path_http][]

Upon receiving a path request containing an `paths`, the array should be processed to look for new/unknown possible networks and those should individually be sent a path request in return to validate and send any priority information.

#### Path Detection / Handling

There are two states of network paths, `possible` and `established`.  A possible path is one that is suggested from an incoming `connect` or one that is listed in an `paths` array, as the switch only knows the network information from another source than that network interface itself.  Possible paths should only be used once on request and not trusted as a valid destination for a hashname beyond that.

An established path is one that comes from the network interface, the actual encoded details of the sender information.  When any `open` or `line` is received from any network, the sender's path is considerd established and should be stored by the switch as such so that it can be used as a validated destination for any outgoing packets.  When a switch detects that a path may not be working, it may also redundantly send the hashname packets on any other established path.

# Switch Behaviors

Besides parsing the protocol, decoding the packets and processing the different channel types, in order to fully implement Telehash a switch must also internally track and respond with the correct behaviors to support both the DHT and manage the network quality and availability between itself and other hashnames.

<a name="kademlia" />
## Distributed Hash Table

Every switch must have both a startup/seeding routine and a background line maintenance process in order to properly support the Kademlia-based DHT.

The seeding process involves recursively performing a [seek](#seek) for it's own hashname against the list of seeds (provided by the app). The act of seeking ones own hashname will bootstrap lines to hashnames that are closest to it, and those hashnames then start to fill in the buckets.

The details of how [kademlia][] is implemented for Telehash are broken out into their own document.

## Line Maintenance

(this area in progress...)

A line may at any point become invalidated if the remote side is disconnected or restarts, so the process of detecting that and deciding to restart a line needs to be defined.

A simple rule to start is invalidating a line after it has been idle for more than 60 seconds or after sending channel packets and not getting any responses for more than 10 seconds (if the switch internally sends seek queries regularly and there's no replies, for instance).

If the switch knows that it is behind a NAT, for any lines that it want's to maintain as active it MUST send at least one packet out at least once every 60 seconds.

This logic will have to evolve into a more efficient/concise pattern at scale, likely involving regular or triggered `path` and `seek` requests, as well as differentiating between if an app is using the line versus the switch maintaining it for it's DHT.


[rsa]:     https://en.wikipedia.org/wiki/RSA_(algorithm)
[sha-256]: https://en.wikipedia.org/wiki/SHA-2
[sybil]:   https://en.wikipedia.org/wiki/Sybil_attack
[ecc]:     https://en.wikipedia.org/wiki/Elliptic_curve_cryptography
[der]:     https://en.wikipedia.org/wiki/Distinguished_Encoding_Rules
[aes]:     https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
[oaep]:    https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding
[ecdh]:    https://en.wikipedia.org/wiki/Elliptic_curve_Diffie–Hellman
[ctr]:     https://en.wikipedia.org/wiki/CTR_mode#Counter_.28CTR.29
[pkcs15]:  https://en.wikipedia.org/wiki/PKCS1

[nist p-256]: http://csrc.nist.gov/groups/ST/toolkit/documents/dss/NISTReCur.pdf
[uncompressed]: https://www.secg.org/collateral/sec1_final.pdf

[sockets]: ext_sockets.md
[tickets]: ext_tickets.md
[ext_bridge]: ext_bridge.md
[kademlia]: kademlia.md
[path_webrtc]: path_webrtc.md
[path_http]: path_http.md
[cipher sets]: cipher_sets.md
