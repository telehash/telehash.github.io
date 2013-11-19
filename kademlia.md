Kademlia
=================

# Introduction

Telehash uses a DHT system based on [Kademlia][].

Every node inside Telehash is a 256bit value based on the sha256 hash of the node's public key.

Based on this size, there will be 256 buckets (so-called k-buckets) which all have room for a certain amount of nodes.
This number K, is not yet defined, but somewhere between 8 and 20 will suffice.

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


## When to store a node
Most of the time, especially on the buckets with a low distance, those buckets will be already be full whenever you
receive a new node for that bucket. At that point, you have to decide what to do with the incoming node.

A node itself could be one of the three following types: a good node, an unknown node, or a bad node. A good node is a
node with which you have communicated not long ago (in the last 60 seconds). Since these nodes are considered good
and should not be removed from the bucket. Unknown nodes are nodes which had no activity since the last 60 seconds, but
they still could be there (you just haven't had a reason to talk to them). Here, you would send out a ping-request, and
see if they would respond. Since we are using UDP, it might be possible that our packet or the response packet has
disappeared, so we make a maximum of 3 attemps. When we didn't receive anything a node is
considered a bad node.

Whenever a new node is available, you should only store them whenever you have bad nodes inside your bucket. If there
are only good nodes, don't store the node inside the bucket. If there are unknown nodes, you could temporarily store
them until you figured out whether or not the unknown node is a good or bad node. From there you could either drop the
new node or replace it bad node with the new node.

This determination of what nodes are best in each bucket is likely to evolve, particularly to deal with different types of flooding attack possibilities at scale and optimizing for hashname seek/query speed.


[pastebin]: http://pastebin.com/0mBr3D8V
[kademlia]: https://en.wikipedia.org/wiki/Kademlia
