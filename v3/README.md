V3 Proposal Changelog
=====================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

* vocabulary - renaming core concepts
  * `open` to `handshake`
  * `line` to `exchange`
  * `line id` to `token`
  * `seed` to `router`
  * `switch` is not used anymore
  * `DHT` to `mesh`
* handshake - wire changes
  * a 'handshake' is just an 'encrypted packet' that contains the sender's identity
  * binary/outer packet must contain an IV/nonce that includes a 4-byte network order seq value (was 'at' on the inner)
  * one temporary key is used per exchange per endpoint
  * channel id base is selected based on the comparison of the public key being used (not the hashname)
  * the seq value must have it's last bit set to it's channnel id base (0 or 1, to prevent conflicts)
  * the highest received seq must always be returned/confirmed in a response handshake for the exchange to be valid
  * handshakes are sent throughout the life of the exchange to verify it's current validity, as needed by the network transport in use
  * exchange tokens are always the first 16 bytes of the handshake's body
* exchange packets
  * the first 16 bytes are always referenced as the `token` and uniquely identify a destination exchange for any routing purposes
* [e3x](e3x) - common internal library interface
  * all wire protocol processing and generation is *cleanly* separated from higher level logic
  * encapsulation of all crypto functions
  * single clearly understood location of all trust decisions
* network transports - increase the types of transports supported by default
  * TLS
  * Tor
  * I2P
  * SSH
  * make use of NAT-PMP / UPnP to increase direct connectivity
  * push notifications
  * BLE
* [hashname](hashname/)
  * use base32 encoding to a string instead of hex
  * use raw byte values during the rollup instead of hex strings
  * parts are always the SHA256 of the normalied public key 
* [telehash](telehash.md) - higher level interoperable library with easy interface
  * manages routers and maintains links to any hashname to form a mesh
  * handles all E3X and transport work internally
  * exposes native stream and socket interfaces
  * WS API
  * HTTP proxy
  * supports discoverable/pairing mode for local transports
* channel changes
  * seek is not used
  * link does not contain `see` or `seed` and is not used to a router, only for mesh connections, contains optional payload packet
  * peer/connect is simple packet relay, always reflects back recipients visible path, can include token to signal/create bridge
  * path, udp=>udp4/udp6, tcp=>tcp4/tcp6, add a via type "via":"hashname" to advertise router

### Implementations

Experimental progress on v2->v3 updates is happening at:

* [telehash-js](https://github.com/telehash/node-telehash/tree/v3)
* [telehash-c](https://github.com/telehash/telehash-c/tree/v3).

### Public DHT vs Private Mesh

V2 included both a public DHT and private mesh networking which made it more difficult to understand, implement, and trust.  There is now a clear separation of this functionality, the Kademlia-based Distributed Hash Table is split out into it's own project called [dotPublic](https://github.com/quartzjer/dotPublic) and v3 no longer includes a DHT, it is focused on being a simple full mesh (p2p) end-to-end encrypted protocol that requires mutual explicit trust to establish any connection.

The changes during 2013/2014 for v2 to add more privacy created a tension between the desire to have zero metadata exposed and how a DHT uses many peers to coordinate activities.  A DHT is a useful tool to provide functionality using *large* numbers of distributed nodes, and the focus for v3 is to enable private communication between *small* numbers of *trusted* nodes.  As the number of nodes increases, so does the risk of automated surveillance of which nodes are communicating.

The mission to provide easy *private* communication tools is paramount, and no identifying information should be visible to any untrusted entity without an explicit decision to do so.  Separating the DHT from the scope is also intended to increase v3's compatibility with other private networking tools like I2P, Tor, TLS, and WebRTC, [and more](https://github.com/redecentralize/alternative-internet).
