Telehash Protocol (v2.1)
========================

The telehash protocol enables any app or device to establish private communication channels over a network. The following combination of features in telehash offers distinctive advantages to application developers:

* all channels are encrypted all the time - there is no unencrypted mode
* because each application instance or device generates its own public/private keypair, security is not dependent on certificate authorities
* addresses are generated from public key fingerprints, not centrally managed as with IP addresses
* routing is based on a globally distributed hash table (DHT), not the hierarchical Domain Name System (DNS)
* the dual JSON/binary packet format is extremely flexible while remaining developer-friendly
* channels can be reliable (like TCP) or unreliable (like UDP), or even re-use HTTP, WebRTC, and other web technologies
* existing application protocols such as NNTP and XMPP can re-use telehash as a secure transport layer
* although telehash apps can run over the current Internet, bindings to Bluetooth, IEEE 802.15.4, and other low-layer transports are also on the way

The telehash protocol has been under development for several years and is actively being [implemented](implementations.md) in multiple progamming languages, collaboration on it's development happens primarily through the protocol's [GitHub repo](https://github.com/telehash/telehash.org/blob/master/implementers.md).

> Also see the [background](background.md) and [FAQ](faq.md).

## Getting Started

Since telehash is it's own networking stack layered above existing networks, it has mechanisms that parallel well known Internet ones and are easy to draw an analogy to:

* `IP` - Addressing in telehash is based on a fingerprint of a public key generated locally by an app (called a `hashname`) instead of a centrally assigned number.
* `Routing` - Hashnames are organized into a DHT that every peer helps maintain, there are no core routers or managed backbone.
* `SSL` - Every hashname is it's own cryptographic identity, there are no central certificate authorites and all communications are always encrypted via a `line`.
* `TCP/UDP` - Any two hashnames can create one or more channels between them to transfer content, each channel can either be reliable (everything is ordered/confirmed) or unreliable (lossy).

All addresses in telehash are called `hashnames` and are self-generated from one or more public `keys`, which are used to verify the hashname and establish encrypted connections between different hashnames.  Those connections are called `lines` and carry encrypted `packets` that are all grouped into one or more `channels`.

This diagram illustrates the structural relationships between the components of the protocol:

![stack](./stack.png =500x)

Telehash is used as an overlay network, connecting hashnames together through various different types of network transports and providing uniform discovery and bridging across them.  This diagram is a simple example of different places any hashname can exist:

![peers](./peers.png =500x)

<a name="protocol" />
# Protocol Index

This is a list of the terminology and index of the common concepts that make up the telehash protocol.  Each one of these is broken into their own document, all of which are required components to implement/use telehash:

* **[hashname](hashname.md)** - The unique address of an individual application/instance using telehash, a 64 character hex string.
* **[packet](packet.md)** - A single message containing JSON and/or binary data sent between any two *hashnames*.
* **[switch](switch.md)** - The software layer or service that manages *channels* and provides the core functionality.
* **[line](cipher_sets.md)** - All *packets* sent between hashnames go over a *line* that is the encrypted session based on which `Cipher Set` is used between them.
* **[channel](channels.md)** - Any *packet* sent over a *line* is part of a *channel*, channels allow simultaneous bi-directional transfer of reliable/ordered or lossy binary/JSON mixed content within any line.
* **[seed](seeds.md)** - A *hashname* must initially start with one or more `seed` to help it discover/connect to other hashnames.
* **[DHT](dht.md)** - Distributed Hash Table, how *hashname* discovery and connectivity is enabled without any central authority.
* **[paths](network.md)** - Packets can be sent over different networks paths, commonly UDP but also HTTP, WebRTC, and more.


As an introduction to how the protocol works, an example startup flow from scratch would look like:

1. create a hashname by generating public/private keypairs
2. load one or more seeds to bootstrap from
3. send an open request to a seed
4. receive an open response and create an encrypted line
5. start a channel over that line
6. send/receive packets over that channel
