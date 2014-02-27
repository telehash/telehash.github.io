Telehash Protocol (v2.1)
========================

Telehash is a new wire protocol that creates encrypted private communication links using a decentralized overlay mesh network.  It enables apps and devices to find, identify, and connect directly with each other using public-key security (PKI) and a distributed hash-table (DHT).

For more background and history on telehash please see the [Introduction](background.md) and the [FAQ](faq.md). Collaboration on the development of telehash is open to anyone passionate about open communication systems and happens primarily through the protocol's [GitHub repo](https://github.com/telehash/telehash.org/blob/master/implementers.md).

## Getting Started

Since telehash is it's own networking stack layered above existing networks, it has mechanisms that parallel well known Internet ones and are easy to draw an analogy to:

* `IP` - Addressing in telehash is based on a fingerprint of a public key generated locally by an app (called a `hashname`) instead of a centrally assigned number.
* `Routing` - Hashnames are organized into a DHT that every peer helps maintain, there are no core routers or managed backbone.
* `SSL` - Every hashname is it's own cryptographic identity, there are no central certificate authorites and all communications are always encrypted via a `line`.
* `TCP/UDP` - Any two hashnames can create one or more channels between them to transfer content, each channel can either be reliable (everything is ordered/confirmed) or unreliable (lossy).

All addresses in telehash are called `hashnames` and are self-generated from one or more public `keys`, which are used to verify the hashname and establish encrypted connections between different hashnames.  Those connections are called `lines` and carry encrypted `packets` that are all grouped into one or more `channels`.

> Diagram goes here


<a name="protocol" />
# Protocol Overview

This is a list of the terminology and index of the common concepts that telehash uses:

* **[hashname](hashname.md)** - The unique address of an individual application/instance using telehash, a 64 character hex string.
* **[packet](packet.md)** - A single message containing JSON and/or binary data sent between any two hashnames.
* **[switch](switch.md)** - The name of the software layer or service parsing packets for one or more hashnames.
* **[line](cipher_sets.md)** - All data sent between hashnames goes over a `line` that is the encrypted session based on which `Cipher Set` is used between them.
* **[channel](channels.md)** - Any `packet` sent over a `line` is part of a `channel`, channels allow simultaneous bi-directional transfer of reliable/ordered or lossy binary/JSON mixed content within any line.
* **[seed](seeds.md)** - A hashname must initially start with one or more `seed` to help it discover/connect to other hashnames.
* **[DHT](dht.md)** - Distributed Hash Table, how hashname discovery and connectivity is enabled without any central authority.
* **[paths](network.md)** - Packets can be sent over different networks paths, commonly UDP but also HTTP, WebRTC, and more.


As an introduction to how the protocol works, an example startup flow from scratch would look like:

1. create a hashname by generating public/private keypairs
2. load one or more seeds to bootstrap from
3. send an open request to a seed
4. receive an open response and create an encrypted line
5. start a channel over that line
6. send/receive packets over that channel
