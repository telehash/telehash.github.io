telehash mesh protocol (v3)
===========================

> this is a draft (issues and pull requests welcome), planning for release version in 01/2015

![logo](logo/mesh-logo-128.png)

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
* [more background](background.md)

The full protocol is a composite of different individual specifications:

* [hashname](hashname/) - public key fingerprint (address format)
* [lob](lob/) - length-object-binary, json+binary serialization (packetization)
* [e3x](e3x/) - end-to-end encrypted exchange (wire encoding, crypto)
* [mesh](mesh.md) - common channels to establish links to peers and maintain a private mesh
* [uri](uri.md) - how to encode/decode endpoint info via URIs for out-of-band bootstrapping
* [transports](transports/) - details for mapping/supporting different network transports
* [logo](../logo/) - for use to represent telehash mesh support in apps 

### Implementations

Experimental implementations are being actively developed at:

* [telehash-js](https://github.com/telehash/telehash-js)
* [telehash-c](https://github.com/telehash/telehash-c).
* [gogotelehash](https://github.com/telehash/gogotelehash)
* [others in progress](https://github.com/telehash)


|              | hashname | link | uri | routing | streams | sockets | udp | tcp | http | tls | webrtc | bluetooth |
|:------------:|:--------:|:----:|:---:|:-------:|:-------:|:-------:|:---:|:---:|:----:|:---:|:------:|:---------:|
|    node.js   |     ✅    |   ✅  |  🔶 |    ✅    |    ✅    |    ✅    |  ✅  |  ✅  |   ✅  |  🔶 |   🔶   |           |
|  browser js  |     ✅    |  🔶  |     |         |         |         |     |     |  🔶  |     |   🔶   |           |
|   c - unix   |     ✅    |   ✅  |  🔶 |    🔶   |    🔶   |    🔶   |  ✅  |  ✅  |      |     |        |           |
| c - embedded |     ✅    |   ✅  |  🔶 |         |    🔶   |    🔶   |  🔶 |  🔶 |      |     |        |           |
|      go      |     ✅    |   ✅  |     |         |         |         |  ✅  |     |      |     |        |           |