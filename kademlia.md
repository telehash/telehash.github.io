Kademlia
=================

# Introduction

Telehash uses a DHT system based on [Kademlia][].

Every node inside Telehash is a 256bit value based on the sha256 hash of the node's public key.

Based on this size, there will be 256 buckets (so-called k-buckets) which all have room for a certain amount of nodes. The number of nodes maintained in each bucket should have two limits, a soft Kmin and hard Kmax, with an overall limit on total nodes maintained of Nmin and Nmax.

In a big p2p network, it's pretty impossible to know all information about all nodes. There would be too much network
overhead for nodes to update each other and the amount of storage you need just to keep track of all nodes is too big.

Kademlia is based the fact that you know a lot about your neighbours, but less and less about further nodes. This means
we need a way to calculate a "distance" between nodes. Note that "distance" here isn't geographical distance. It might
be possible that you are a "close" neighbour to a node on the other side of the world, while a node running on a computer
in the same room, could be a far away.


## Calculating distance
Distance calculation in kademlia is a 2-step process:


   - Exclusive or (xor) the 2 node strings.
   - Find the first bit that is 1, starting from the most significant bit.

Using xor has a few properties: first of all, xor(a,a) something with yourself always returns 0. xor(a,b) is the same
as xor(b,a), meaning that both nodes calculate the same distance to each other.

An example with 6bit nodes:

    Node A (21) in binary form:  010101
    Node B (31) in binary form:  011111


We XOR the 2 nodes:

    010101
    011111
    ------- ⊕
    001010

The next step is to find the first bit that is '1', starting from left to right. In this case, this would be at offset
2 (counting from zero-based). This means that the distance between node A and B is 2, and this node should be stored in
k-bucket number 2, but it makes more sense to store this in k-bucket (6-2). This means that a higher distance means the
node is further away, and the concept distance makes a bit more sense.

The distance between two very close neighbours:

    010101
    010100
    ------- ⊕
    000001

Here the first 1 bit is at position 5. And thus this node should be stored in k-bucket (6-5) = 1



## Knowing a lot about your neighbours
If you add many nodes to your buckets, you will notice that on average 50% of the nodes will be stored in bucket 6, 25%
will be stored in bucket 5, 12.5% in bucket 4 etc etc. In the end, the 1'st bucket holds the nodes that are very close
to you, and only 1.5% of the nodes will actually be stored here.

When dealing with 256bit, there is a 0.00076% chance that bucket 240 (thus, where the first 16 bits of the nodename
matches), will be stored. The chances that the first 50 bits will match (and the node would be stored in bucket 206),
is phenomenally small: 0.000000000000001%.

As said before, k-buckets only has room for a certain amount of nodes (between 8 and 20 normally). Because half of the
nodes you will receive falls into bucket 256 (where distance = 0), we can only store up to 20 of those. So if we receive
500 nodes, on average, 250 of them will fall in bucket 256 but we only store 20 of them (see the next chapter on how to
figure out which nodes to store). In bucket 250, where the distance of the nodes are 6, and thus are "closer" to use,
will on average be able to store 0.78% of the nodes. Again, from the 500 incoming nodes this means we would store on
average around 4 nodes. As 4 nodes could easily fit inside this bucket, we can remember all these nodes.

The following [pastebin][] shows you an example on how k-buckets are filled with a 100,000
random generated nodes, as seen from our own node: 736711cf55ff95fa967aa980855a0ee9f7af47d6287374a8cd65e1a36171ef08.
Even when so many nodes are processed, we still only fill the first 15 buckets.

## Default Limits

The suggestions for a default Nmin and Nmax are 64 and 1024, with bare minimums being 8 and 32 for low-resource switches. For Kmin and Kmax (per-bucket) the defaults are 8 and 32, with minimums being 2 and 8.  The Nmax must always be less than or equal to 256 * Kmax.

The Kmin/Kmax can be thought of as soft are hard limits for each bucket, with the min being the number of hashnames that are sent maintenance checks and the max being the point at which new nodes are denied being added to the bucket.

The Nmin is used to trigger seeding requests, regularly querying other hashnames to reach the Nmin. If Nmax is reached, nodes should still be added to closer buckets with capacity but will force eviction from further buckets (always maintain closer neighbors).

## `"type":"bucket"` - Adding a node to a Bucket

An unreliable channel of type `bucket` is used to signal the desire to add a node to a bucket.  Whenever a hashname is encountered that would be in a bucket that has capacity, the switch may start this channel to see if it can be added to that bucket.

The bucket channel start request should always include a `see` array identical to the `seek` response of the hashnames closest to the recipient.

Upon receiving a bucket channel request, the switch should check the bucket the sender would be in for capacity.  If it is at Kmax (or Nmax and it's a distant bucket) it should return an error, otherwise it should always immediately return a packet to confirm the channel and include a `see` array of the hashnames closest to the sender and place them in the correct bucket.

Once the original initiator has received a confirmation back for a bucket channel it should also place them in the correct bucket.

At any point either side of a bucket channel may send an ad-hoc packet on the channel containing a `see` array.  Upon receiving this, the recipient must return a `see` array if it hasn't sent one in over 30 seconds.  These are called maintenance packets/requests.  The hashnames included in the array should be examined for possible inclusion in buckets that have capacity.

## Bucket Maintenance

Every bucket must be checked once every 25 seconds for possible maintenance. Only the Kmin number of nodes in a bucket need to be sent maintenance packets, and they should be sorted/prioritized by uptime.  Any node that hasn't sent any packets on it's bucket channel in more than 60 seconds should be evicted from the bucket. Based on the last received packet on the channel, if that time plus 25 seconds would be more than 60 it should be sent a maintenance request.

### "hide":true - Hidden Nodes

Some nodes may need to be discoverable, but do not have resources to help maintain the DHT and cannot therefore be returned to normal `seek` queries.  When a bucket channel is opened it may contain an optional `"hide":true` that signals this special case.

The hidden node is still added to the bucket, but it is not sent any maintenance `see` packets, it must generate them in order to keep the channel alive.  Hidden nodes should not count against the per-bucket limit

When handling a `seek` a hidden node can only be returned if it *exactly* matches the seek request, if the given seek hash does not entirely match, a hidden node must not be returned.


[pastebin]: http://pastebin.com/0mBr3D8V
[kademlia]: https://en.wikipedia.org/wiki/Kademlia
