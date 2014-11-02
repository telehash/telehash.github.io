telehash mesh protocol (v3)
===========================

> this is a draft, issues and pull requests welcome
> planning for release version in 01/2015

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

