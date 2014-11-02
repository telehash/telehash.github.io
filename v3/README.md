telehash mesh protocol (v3)
===========================

> this is a draft, issues and pull requests welcome
> planning for release version in 01/2015

Telehash is a project to create interoperable private mesh networking:

* 100% end-to-end encrypted at all times
* designed to compliment and add to existing transport security
* easy to use for developers to encourage wider adoption of privacy
* manages active link state on all connections
* native implementations to each language/platform
* capable of using different transport protocols
* supports bridging and routing privately or via a DHT
* each endpoint has verifiable unique fingerprint
* provides native tunneling of TCP/UDP, HTTP, WebSockets, and more
* strict privacy, no content, identity, or metadata is ever revealed to 3rd parties
* designed for compatibility between embedded device, mobile, and web usage

The full protocol is a composite of different individual specifications:

* [hashname](hashname/) - public key fingerprint (address format)
* [lob](lob/) - length-object-binary, json+binary serialization (packetization)
* [e3x](e3x/) - end-to-end encrypted exchange (wire encoding, crypto)
* [mesh](mesh.md) - common channels to establish links to peers and maintain a private mesh

### Implementations

Experimental implementations are being actively developed at:

* [telehash-js](https://github.com/telehash/node-telehash/tree/v3)
  * working: e3x, cs1a, channels (link, peer, path, stream), transports (udp4)
* [telehash-c](https://github.com/telehash/telehash-c/tree/v3).
  * working: e3x, cs1a, channels (link), transports (udp4)

