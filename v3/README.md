V3 Proposal Changelog
=====================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

* vocabulary - renaming core concepts
  * `open` to `handshake`
  * `line` to `exchange`
  * `line id` to `token`
  * `seed` to `router`
  * `switch` to `endpoint`
  * `DHT` to `mesh`
  * `message` is an async encrypted packet between endpoints
  * `channel` is stream encryption using an exchange
* handshake - wire changes
  * a 'handshake' is just an 'encrypted message' that contains the sender's identity
  * the first 16 bytes must always contain or be derived from the exchange's ephemeral public key
  * one ephemeral key is used per exchange per endpoint
  * channel id base is selected based on the comparison of the public key being used (not the hashname)
  * the inner `at` value must have it's last bit set to it's channnel id base (even or odd, to prevent conflicts)
  * the highest received `at` must always be returned/confirmed in a response handshake for the exchange to be valid
  * handshakes are sent throughout the life of the exchange to verify it's current validity, as needed by the network transport in use
  * exchange tokens are always derived from the first 16 bytes of the handshake's body
* encrypted channel packets
  * the first 16 bytes are always referenced as the `token` and uniquely identify a destination exchange for any routing purposes
* [e3x](e3x) - common internal library interface
  * all wire protocol processing and generation is *cleanly* separated from higher level logic
  * encapsulation of all crypto
  * single clearly understood interaction for all trust decisions
* network transports - increase the types of transports supported by default
  * TLS
  * Tor
  * I2P
  * SSH
  * make use of NAT-PMP / UPnP to increase direct connectivity
  * push notifications
  * BLE
* [hashname](hashname/)
  * use base32 encoding to a string instead of hex to increase compatibility with systems like DNS
  * use raw byte values during the rollup instead of hex strings
  * intermediate values are always the SHA-256 of the normalized public key 
* [telehash](telehash.md) - higher level interoperable library with easy interface
  * manages routers and maintains links to any hashname to form a mesh
  * handles all e3x and transport work internally
  * exposes native stream and socket interfaces
  * WS API
  * native HTTP support
  * handles discoverable/pairing mode for local transports
* channel changes
  * seek is not used
  * [link](channels/link.md) does not contain `see` or `seed`, contains optional payload packet for app to validate
  * [peer](channels/peer.md)/[connect](channels/connect.md) is a single request only, bridging is automatic
  * [path](channels/path.md), udp=>udp4/udp6, tcp=>tcp4/tcp6, add a peer type with hashname to advertise a router

### Implementations

Experimental progress on v2->v3 updates is happening at:

* [telehash-js](https://github.com/telehash/node-telehash/tree/v3)
  * working: e3x, cs1a, channels (peer, path, stream)
* [telehash-c](https://github.com/telehash/telehash-c/tree/v3).
  * in-progress

### Public DHT vs Private Mesh

V2 included both a public DHT and private mesh networking which made it more difficult to understand, implement, and trust.  There is now a clear separation of this functionality, the Kademlia-based Distributed Hash Table is split out into it's own project called [dotPublic](https://github.com/quartzjer/dotPublic) and v3 no longer includes a DHT, it is focused on being a simple full mesh (p2p) end-to-end encrypted protocol that requires mutual explicit trust to establish any connection.

The changes during 2013/2014 for v2 to add more privacy created a tension between the desire to have zero metadata exposed and how a DHT uses many peers to coordinate activities.  A DHT is a useful tool to provide functionality using *large* numbers of distributed nodes, and the focus for v3 is to enable private communication between *small* numbers of *trusted* nodes.  As the number of nodes increases, so does the risk of automated surveillance of which nodes are communicating.

The mission to provide easy *private* communication tools is paramount, and no identifying information should be visible to any untrusted entity without an explicit decision to do so.  Separating the DHT from the scope is also intended to increase v3's compatibility with other private networking tools like I2P, Tor, TLS, and WebRTC, [and more](https://github.com/redecentralize/alternative-internet).
