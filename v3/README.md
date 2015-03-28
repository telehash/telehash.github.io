telehash secure mesh protocol (v3)
==================================

> this is a draft (issues and pull requests welcome), planning for release version in 03/2015

![logo](logo/mesh-logo-128.png)

Telehash is a project to create interoperable private mesh networking, see the [introduction](intro.md) for more background.

The full protocol suite is a composite of multiple individual specifications:

* [hashname](hashname.md) - endpoint address format (public key fingerprint)
* [packets](lob.md) - length-object-binary formatted packets, json+binary serialization
* [E3X](e3x/) - end-to-end encrypted exchange (wire encoding, crypto libraries)
* [link](link.md) - establishing and maintaining connections between two endpoints
* [mesh](mesh.md) - higher level tools to manage multiple links and do local discovery
* [uri](uri.md) - how to encode/decode endpoint info via URIs for out-of-band bootstrapping
* [transports](transports/) - details (encoding, timeouts, discovery, etc) for mapping/supporting different network transports
* [logo](logo/) - for use to represent telehash support in apps 

The primary discussion area is currently via Slack, anyone can join by getting an [automated invite](http://6.telehash.org:3000).

<a name="implementations" />
### Implementations

Each implementation provides a library API adapted to its platform or language but they all strive to offer similar functionality including handling hashnames, URIs, and packets (lob), higher level interfaces to create a mesh and links within it, and lower level tools for E3X, transports/pipes, managing keys, etc.  Refer to the [implementers guide](guides/implementers.md) for an overview of the typical methods and patterns.

Experimental implementations are being actively developed at:

* [telehash-js](https://github.com/telehash/telehash-js)
* [telehash-c](https://github.com/telehash/telehash-c).
* [gogotelehash](https://github.com/telehash/gogotelehash)
* [python](https://github.com/telehash/e3x-python)
* [c#](https://github.com/telehash/telehash.net)
* [others in progress](https://github.com/telehash)


|              | hashname | link | uri | routing | streams | sockets | udp | tcp | http | tls | webrtc | bluetooth |
|:------------:|:--------:|:----:|:---:|:-------:|:-------:|:-------:|:---:|:---:|:----:|:---:|:------:|:---------:|
|    node.js   |     ✓    |   ✓  |  ✍ |    ✓    |    ✓    |    ✓    |  ✓  |  ✓  |   ✓  |  ✍ |   ✍   |           |
|  browser js  |     ✓    |  ✍  |     |         |         |         |     |     |  ✍  |     |   ✍   |           |
|   c - unix   |     ✓    |   ✓  |  ✍ |    ✍   |    ✍   |    ✍   |  ✓  |  ✓  |      |     |        |           |
| c - embedded |     ✓    |   ✓  |  ✍ |         |    ✍   |    ✍   |  ✍ |  ✍ |      |     |        |           |
|      go      |     ✓    |   ✓  |     |         |         |         |  ✓  |     |      |     |        |           |
|    python    |     ✓    |   ✍  |    |         |        |        |  ✍ |    |      |     |        |           |
