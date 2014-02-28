# Frequently Asked Questions

These are questions that come up often, to add new ones please [file an issue](https://github.com/telehash/telehash.org).

<a name="protocol" />
## Protocol

* **How does telehash compare to X?** - There are a [great many](https://github.com/redecentralize/alternative-internet) efforts that have some similarity to telehash, it's not possible to maintain a comparison to all of them as most are constantly evolving.  Many of the telehash developers help on multiple projects and believe that this is a collective effort, frequently combining and sharing solutions to move everyone ahead.

* <a name="simultaneous" />**Can one hashname be used in two places at once?** - As two completely distinct/decoupled entities, no, it would cause conflicting line handshakes depending on whichever hashname responded first.  If implemented so that there is some shared private state/storage mechanism between the instances where line information is held and coordinated, then yes a hashname can be available at many different network locations.  For example, one hashname can be used from many datacenters simultaneously as long as they all use the same distributed database for line state.

<a name="dht" />
## Distributed Hash Table

* **Is the DHT required?** - No, it's very useful for most situations, but a switch can be given one or more seeds that act as the sole operater/coordinator for connecting to other hashnames.  A DHT is required when there is no central authority that knows all of the relevant hashnames.

* **Can I create a private DHT?** - The DHT in telehash is designed to be a single unified one, but for special circumstances it is possible to create a completely separate/private one by using a fixed/managed set of seeds.  Every seed must know the hashnames of the other seeds and never form a link with any outside of that list.  Apps must then use only one or more of those hashnames in their seeds to bootstrap from.

* **How will it survive a DDOS?** - There are two aspects that contribute to being DDOS resistant, one is that there is nothing in the protocol that amplifies, where any one packet can be turned into two or more, so sending telehash packets has no advantage over sending just random data.  The other is that seeds are only used to bootstrap on first boot, every switch should save out a [hints](hints.md) file after it starts so that it doesn't depend on a fixed list of seeds (that would be a DDOS target).

<a name="security" />
## Security

* **Can the DHT see traffic?** - The short answer is *no*, all content is always encrypted and nothing ever has the ability to read it.  The longer answer is that while nothing is visible, it's possible for the physical network and at least one seed on the DHT to see that two endpoints have connected to each other.  There's no way to know *why* they connected or what they're sending each other, and due to the DHT meshing such connections are very common and random. There is a [proposed extension](ext/ort.md) in development for when physical network location must be hidden, and another [discussion](ext/shaping.md) around packet obfuscation.

* **Why not use TLS?** - Transport Layer Security is designed with specific requirements around how the key management is done and bound to a reliable/ordered network layer.  Fundamentally, telehash must support an unreliable network to enable the most direct connectivity and there is no key management, every peer generates their own dynamically.

* **What if an algorithm is broken?** - In the worst case, if a crypto algorithm that is highly trusted is broken and that Cipher Set cannot be used any longer, a switch must remove or replace that CSID in the hashname and when requests come in to the old hashname it must respond and include the newly calculated one.  This enables apps to upgrade/migrate from old hashnames to new ones over time.
