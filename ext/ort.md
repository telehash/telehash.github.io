# ORT - Opaque Routing Tree

(NOTE: this is just a placeholder for discussions around the feasibility of these ideas atop telehash)

While telehash provides a distributed mesh, it doesn't inherently protect the physical network identity of any node using it.  A hashname is intrinsically identified by and associated with it's one or more current network addresses (usually IP).

ORT is a method for overlaying a privacy routing service atop telehash such that a sender and recipient cannot discover each others current network address, similar to the functionality in services like [Tor](https://www.torproject.org) and [I2P](http://www.i2p2.de) but only within telehash, not for anonymizing general Internet connectivity.

### Brainstorming Thoughts

Routing:

* use the same kademlia distance pattern to create a secondary DHT of just ORT nodes
* any sender or recipient must establish an initial "branch" location on the DHT
* everyone creates one or more "traces" between it and a branch
* packets only contain a next-hop, that hop must have had a trace created to translate it
* senders and recipients may both create multiple traces, each trace increases privacy

Network Capacity:

* the ORT cloud is always running at 100% capacity
* packets w/o a trace are randomly forwarded (noise, to fill capacity)
* new/real content must be swapped out for random packets
* force stable nodes to receive more in order to utilize capacity

Content Packets:

* is a `line` alternative/wrapper (switches process normally after validating/deciphering)
* must allways be exactly 1k
