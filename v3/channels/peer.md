### `"type":"peer"` - Introductions to new hashnames

For any hashname to send an open to another it must first have one of its public keys, so all new opens must be "introduced" via an existing line. This introduction is a two step process starting with a peer request to an intermediary. Since new hashnames are discovered only from another one in the `see` values, the one returning the see is tracked as a "via" so that they can be sent a `peer` request when a connection is being made to a hashname they sent. This also serves as a workaround if any NAT exists, so that the two hashnames can send a packet to each other to make sure the path between them is open, this is called "hole punching." 

A peer request requires a `"peer":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"` where the value is the hashname the sender is trying to reach. The BODY of the peer request must contain the binary public key of the sender, whichever key is the highest matching [Cipher Set](cipher_sets.md) as signalled in the original `see`.  The recipient of the peer request must then send a connect (below) to the target hashname (that it already must have an open line to).

The peer channel that is created remains active and serves as a path for [tunneled](#relay) packes to/from the requested hashname, those tunneled packets will always be attached as the raw BODY on any subsequent sent/received peer channel packets.  The default inactivity timeout for a peer channel is the same as a connect, 30 seconds.

If a sender has multiple known public network paths back to it, it should include an [paths](#paths) array with those paths, such as when it has a valid public ipv6 address.  Any internal paths (local area network addresses) must not be included in a peer request, only known public address information can be sent here.  Internal paths must only be sent in a [path](#path) request since that is private over a line and not exposed to any third party (like the peer/connect flow is).

```json
{
  "c":10,
  "type":"peer",
  "peer":"ed1a50bdd08846ee9ed504ba59469a843b234dc9e6e56470b76ff8839b08039c",
  "paths":[{"type":"ipv4","ip":"12.14.16.18","port":24242}]
}
BODY: ...sender's binary public key...
```
