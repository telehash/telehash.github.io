Telehash Protocol (v2.1-pre)
========================

The telehash protocol enables any app or device to establish private communication channels over a network. The following combination of features in telehash offers distinctive advantages to application developers:

* all channels are encrypted all the time - there is no unencrypted mode
* because each application instance or device generates its own public/private keypair, they cannot be impersonated and security is not dependent on trust in certificate authorities
* addresses are generated from public key fingerprints, not centrally managed as with IP addresses
* routing is based on a globally distributed hash table (DHT), no central authority or managed heirarchy
* the dual JSON/binary packet format is extremely flexible while remaining developer-friendly
* channels can be reliable (like TCP) or unreliable (like UDP), and make use of HTTP, WebRTC, and other existing technologies
* existing application protocols such as NNTP and XMPP can re-use telehash as a secure transport layer
* although telehash apps can run over the current Internet, bindings to Bluetooth, IEEE 802.15.4, and other low-layer transports are also on the way

The telehash protocol has been in development for several years. It is being actively implemented in multiple progamming languages and is currently being deployed experimentally to prepare for wider usage.

> See the [list of implementations](implementations.md) to start using telehash right away, also see the [background](background.md) to learn more, [FAQ](faq.md), and [GitHub repo](https://github.com/telehash/telehash.org/blob/master/implementers.md) to contribute.

## Getting Started

Since telehash is its own networking stack layered above existing networks, it has mechanisms that parallel well known Internet ones and are easy to draw an analogy to:

* `IP` - Addressing in telehash uses a fingerprint of a public key generated locally by an app (called a *hashname*) instead of a centrally assigned number.
* `Routing` - Hashnames are organized into a *DHT* that every peer helps maintain, there is no backbone or core routers.
* `SSL` - Every hashname is its own cryptographic identity, there are no central certificate authorites and all communications are always encrypted via a *line*.
* `TCP/UDP` - Any two hashnames can create one or more *channels* between them to transfer content (like ports), each channel can either be reliable (everything is ordered/confirmed like TCP) or unreliable (lossy, like UDP).
* `Host` - An online instance and the software that is managing it (sometimes called the "network stack") is called a *switch*, the generic name for the software that is processing raw packets.

All addresses in telehash are called `hashnames` and are self-generated from one or more public `keys`, which are used to verify the hashname and establish encrypted connections between different hashnames.  Those connections are called `lines` and carry encrypted `packets` that are all grouped into one or more `channels`.  Everything is being run/managed by a software instance called a `switch`.

This diagram illustrates the structural relationships between the components of the protocol:

<img src="stack.png" width="500" />

Telehash is used as an overlay network, connecting hashnames together through various different types of network transports and providing uniform discovery and bridging across them.  This diagram is a simple example of different places a hashname can exist:

<img src="peers.png" width="500" />

<a name="protocol" />
# Protocol Index

This is a list of the terminology and index of the common concepts that make up the telehash protocol.  Each one of these is broken into their own document, all of which are required components to implement/use telehash:

* **[hashname](hashnames.md)** - The unique address of an individual application/instance using telehash, a 64 character hex string.
* **[packet](packet.md)** - A single message containing JSON and/or binary data sent between any two *hashnames*.
* **[channel](channels.md)** - A *channel* is a series of one or more *packets* grouped together, multiple channels can exist simultaneously to allow bi-directional transfer of reliable/ordered or lossy binary/JSON mixed content.
* **[line](network.md#line)** - All *channels* are encrypted as part of a *line* using a common [Cipher Set](cipher_sets.md) between two hashnames.
* **[switch](switch.md)** - The software layer or service that manages *channels* and provides the core functionality.
* **[seed](seeds.md)** - A *hashname* usually starts with one or more *seed* to help it discover/connect to other hashnames.
* **[DHT](dht.md)** - Distributed Hash Table, how *hashname* discovery and connectivity is enabled without any central authority.
* **[paths](network.md#paths)** - Any encrypted *line* data can be sent over different networks paths, commonly UDP but also HTTP, WebRTC, and more.


As a quick introduction to how the protocol works, an example startup flow for a [switch](implementations.md) would look like:

1. **create a hashname** - generate public/private keypairs, results in the parts/keys that make up a new [hashname](hashnames.md)
2. **load seeds** - use a bundled [seeds.json](seeds.md) file to load information about one or more seeds to bootstrap from
3. **send an open** - compose a new encrypted [open](network.md#open) request to a seed, the handshake to create a line
4. **receive an open** - process the response open, decrypt it, and use the handshake and create a new [line](network.md#line)
5. **start a link channel** - to join the [DHT](dht.md) via this seed, start a new [channel](channels.md) of type [link](switch.md#link) which is sent over the encrypted line

In order for a switch to connect to another hashname from this point, an example flow would look like:

1. **seek the hashname** - send a new [seek](switch.md#seek) request to the [closest](dht.md#distance) connected seed (one with an active link channel)
2. **process the response** - check the response for the hashname, recursively send seeks until found
3. **send a peer request** - when the hashname is returned in a seek response send a [peer](switch.md#peer) request to the seed, and if there's any IP/port send an empty packet to it to NAT hole punch
4. **seed sends connect request** - the seed will process the peer request and send a [connect](switch.md#connect) to the given hashname
5. **open sent** - the given hashname will process the connect, and send an [open](network.md#open) back to create the line
6. **line created** - once the open is received, send one back to create a line, and continue sending any new [channel](channels.md) packets
