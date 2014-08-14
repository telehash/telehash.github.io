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
  * use base58 encoding to a string instead of hex
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
  * path, udp=>udp4/udp6, tcp=>tcp4/tcp6

### Implementations

Experimental progress on v2->v3 updates is happening at:

* [telehash-js](https://github.com/telehash/node-telehash/tree/v3)
* [telehash-c](https://github.com/telehash/telehash-c/tree/v3).

### DHT to Mesh

V3 no longer includes a Kademlia-based Distributed Hash Table and is instead is a simple full mesh end-to-end encrypted protocol that requires mutual explicit trust to establish any connection, with optional support for p2p routing coordination.

The changes during 2013/2014 for v2 to focus on privacy have created a tension between the desire to have zero metadata exposed and how a DHT uses many peers to coordinate activities.  The mission to provide easy *private* communication tools is paramount, and no identifying information should be visible to any untrusted entity by default.  Reducing the scope of telehash is also intended to increase it's compatibility with other decentralized private networking tools like I2P/Tor and so that it can be used easily within existing encrypted transports like TLS and WebRTC.

A DHT is a useful tool to provide functionality using *large* numbers of decentralized nodes, and our focus for v3 is to enable private communication between *small* numbers of *trusted* nodes.  As the number of nodes increases, so does the risk of surveillance of which nodes are communicating.

Part of the v3 implementation work will be to demonstrate using some of the other [distributed networking](https://github.com/redecentralize/alternative-internet) platforms along with telehash for applications that require a public shared hashname directory that the DHT in v2 was being used for.
