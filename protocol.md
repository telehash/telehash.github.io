Telehash protocol draft
=================

document reorg in progress:

* [Introduction](background.md)
* [Hashname Definition](hashnames.md)
* [Channel Definition](channels.md)
* [FAQ](faq.md)
* [Implementers Guide](implementers.md)
* [Network Interface](network.md)
* [Packet Format](packet.md)
* [Switch Functionality](switch.md)

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
