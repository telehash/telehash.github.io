# Frequently Asked Questions

These are questions that come up often, to add new ones please [file an issue](https://github.com/telehash/telehash.org).

<a name="protocol" />
## Protocol

* **How does telehash compare to X?** - There are a [great many](https://github.com/redecentralize/alternative-internet) efforts that have some similarity to telehash, it's not possible to maintain a comparison to all of them as most are constantly evolving.  Many of the telehash developers help on multiple projects and believe that this is a collective effort, frequently combining and sharing solutions to move everyone ahead.

<a name="dht" />
## Distributed Hash Table

* **Is the DHT required?** - No, it's very useful for most situations, but a switch can be given one or more seeds that act as the sole operater/coordinator for connecting to other hashnames.  A DHT is required when there is no central authority that knows all of the relevant hashnames.

<a name="security" />
## Security

* **Why not use TLS?** - Transport Layer Security is designed with specific requirements around how the key management is done and bound to a reliable/ordered network layer.  Fundamentally, telehash must support an unreliable network to enable the most direct connectivity and there is no key management, every peer generates their own dynamically.

* **What if an algorithm is broken?** - In the worst case, if a crypto algorithm that is highly trusted is broken and that Cipher Set cannot be used any longer, a switch must remove or replace that CSID in the hashname and when requests come in to the old hashname it must respond and include the newly calculated one.  This enables apps to upgrade/migrate from old hashnames to new ones over time.
