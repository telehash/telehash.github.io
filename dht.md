Distributed Hash Table
======================

A Distributed Hash Table (DHT) has become a common solution for decentralized routing in both large online networks and multi-server cloud database systems.  It is used within telehash to provide connectivity for hashnames, the ability to ask the network about a hashname and reliably be connected to it if it's available.

While [Wikipedia](http://en.wikipedia.org/wiki/Distributed_hash_table) has an article describing the concept in more detail, it is fundamentally very simple: a set of computed hashes (SHA-256 in telehash) are mapped to all of the peers supporting the DHT by a simple rule, and those peers maintain their list of hashes and respond to queries about them.

The important part of any DHT is the ability to handle peers joining and leaving, and ensuring that no malicious peer can interfere with the queries and connectivity.  There have been many different solutions to these types of common DHT challenges, and for telehash these rules have been derived from a DHT named [Kademlia][].

> Also see the [FAQ](faq.md#dht) for common questions and [Implementers Notes](implementers.mddhts) for help when implementing the DHT

# Kademlia-Based Fundamentals

Telehash adapts the [Kademlia][] Distributed Hash Table for it's peer discovery. A "peer" in this document is a single application instance, one unique hashname.

Unlike the original Kademlia paper that was a key-value store, there is no arbitrary data stored in the DHT. Peers query the DHT purely to locate other peers, independent of IP or other transient network identifiers. Telehash also departs from Kademlia by using SHA2 256-bit hashes (rather than SHA1 160-bit hashes).

Like any DHT, telehash peers cooperatively store all network information while minimizing per-peer costs. Derived from Kademlia's hash-based addressing and distance calculations, the average number of "nearby" peers will grow logarithmically compared to the total global number of peers. Peers then attempt to keep track of all of the closest peers, and progressively fewer of the farther away peers. This pattern minimizes "degrees of separation" between peers while also minimizing the number of other peers each indidivual peer must keep track of.

Like Kademlia, telehash measures distance with a bitwise XOR metric which divides the address space into 256 possible partitions, also called `k-buckets`.  Every peer when compared will have a `bucket` value based on the bit that differs, if the first bit is different the bucket would be 255, and if the entire first byte is the same the bucket for that peer would be 247.

The two protocol elements for interacting with the telehash DHT are [seek](switch.md#seek) and [link](switch.md#link) channels.  The `seek` channel allows asking any peer for a list of closer hashnames, and the `link` channel is how peers signal to each other that they are actively participating in the DHT.

## XOR - Calculating distance
Distance calculation is a 2-step process:

   - Exclusive or (xor) the 2 hashnames.
   - Find the first bit that is 1, starting from the most significant bit.

Using xor has a few properties: first of all, xor(a,a) something with yourself always returns 0. xor(a,b) is the same
as xor(b,a), meaning that both peers calculate the same distance to each other.

An example with 6bit hashnames:

    Peer A (21) in binary form:  010101
    Peer B (31) in binary form:  011111


We XOR the 2 hashnames:

    010101
    011111
    ------- ⊕
    001010

The next step is to find the first bit that is '1', starting from left to right. In this case, this would be at offset
2 (counting from zero-based). This means that the distance between peer A and B is 2, and this peer should be stored in
k-bucket number 2, but it makes more sense to store this in k-bucket (6-2). This means that a higher distance means the
peer is further away, and the concept distance makes a bit more sense.

The distance between two very close neighbours:

    010101
    010100
    ------- ⊕
    000001

Here the first 1 bit is at position 5. And thus this peer should be stored in k-bucket (6-5) = 1


## Managing Limits

In order to manage how many peers each one has to keep track of, there are two limits that every peer must manage, `k` and `max-link`.

When resource constrained and choosing low limits, all links should also be set to `"seed":false` so that the peer isn't participating in general DHT queries.

<a name="k" />
### `k` - Bucket Size

When storing any peer in a bucket (based on an open `link`) a switch must manage how many peers it maintains per bucket to minimize it's own resource usage.  The `k` value default is currently 8, and should never be set below 2 so that any bucket always has at least one backup peer in it.  When performing bucket maintenance (below) only this value of peers is processed per bucket.

A small value impacts both the speed of querying other peers since the buckets act as an initial index of where to send the first `seek`, and too few will likely result in additional round-trips to find another peer.  It also impacts a peers own discovery, as it reduces how many nearby peers know about it so an incoming `seek` for it will take more round-trips to get closer.  

A larger value then both reduces the seek time for connecting to other peers, and reduces the time it takes for incoming connections.  Having a value larger than 100 is diminishing returns though and should only be needed in very special cases.

<a name="max-link" />
### `max-link` - Total Links

The primary mechanism for any peer to limit how many other peers it's keeping track of overall is `max-link`, the total number of active `link` channels open to other peers.  The default value is currently 256, with a minimum of 8, and a maximum of unlimited (for dedicated seeds).

When any new incoming `link` is requested this value is checked, and if the total links is less than `max-link` then the new request should be accepted.  If the switch is at `max-link` then it must check the distance to the new incoming peer to see if it should evict a more distant one.  This eviction check looks at any bucket that is further (larger) than the incoming link and has more than `k` peers in it, and evict the newest link in that bucket if any.  If there are no other links to evict, then the incoming one should be denied.

A small value will have the same impact as a small `k`, increasing the cost to search and be found on the DHT. Any single bucket should never fall below `k` even if the total links is greater than a small `max-link`.

A large value increases the number of maintenance activity from all of the active links, with a minimum of one packet sent/received per link per minute, with a `max-link` of 600 active it would average 10 packets per second to maintain the DHT.

## Knowing a lot about your neighbours
If you add many peers to your buckets, you will notice that on average 50% of the peers will be stored in bucket 255, 25%
will be stored in bucket 254, 12.5% in bucket 253, etc. There is a 0.00076% chance that bucket 240 (where the first 16 bits of the hashname matches), will be used. The chances that the first 50 bits will match (and the peer would be stored in bucket 206), is phenomenally small: 0.000000000000001%.

As explained above, each k-bucket only has room for maintaining `k` number of peers, so for a random 500 peers then on average 250 of them will fall in bucket 255, but only `k` of them would have their link maintained by us. In bucket 250 where the peers are "closer", we will on average be able to maintain 0.78% of the peers. Again, from the 500 random peers this means we would maintain approximately 4 peers.

The following [pastebin][] shows you an example on how k-buckets are filled with a 100,000
random generated peers, as seen from our own peer: 736711cf55ff95fa967aa980855a0ee9f7af47d6287374a8cd65e1a36171ef08.
Even when so many peers are processed, we still only fill the first 15 buckets.

<a name="age" />
## Age Tracking (Sybil Resistance)

In order to make the various kinds of common DHT attacks such as [Sybil](https://en.wikipedia.org/wiki/Sybil_attack) more difficult, it is helpful for a peer to keep track the timestamp of the first time it establishes a link with any other hashname.  This timestamp is called `age` and is used when determining what hashnames to include in any `see` response, both during the link exchange and in seek responses.  The age should be stored long-term if possible, particularly for any peer that is acting as a seed.  Peers with an age that haven't been seen for more than 30 days may be expired/reset.

When generating a `see` during link setup, if there are more peers in the bucket for that link then those peers are sorted only by age, returning the oldest of them.  This ensures that any peer that is bootstrapping new links only discovers the older seeds, and any newer nearer seeds that are generated after it don't get prioritized over ones that existed nearby before it.

When answering a `seek` request, the first entry in the `see` must be the oldest (active) seed from the matching bucket, followed by any exact matches and the other seeds in that bucket that are the closest. When performing a `seek` they should always be initiated to the oldest nearby seeds, and the first address returned in their `see` is tracked as the "backstop" to signal when to stop recusively seeking the results.  The backstop is updated whenever a previous backstop returns a closer first address in it's see.

<a name="maintenance" />
## Bucket Maintenance

Every bucket must be checked once every 55 seconds for possible maintenance. Only the `k` number of peers in a bucket need to be sent maintenance packets, and they should be sorted/prioritized by uptime with the oldest age being preferred.  Any peer without any received link maintenance activity in more than 120 seconds should be evicted from the bucket.

In case there are multiple links between any two peers, only the most recently active one should be used for maintenance checks/requests.  Whenever a new link is started, it replaces the last known one (if any).


[pastebin]: http://pastebin.com/0mBr3D8V
[kademlia]: references.md
