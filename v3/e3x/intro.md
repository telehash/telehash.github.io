# E3X - End-to-End Encrypted eXchange

`E3X` is a flexible end-to-end encrypted wire protocol, a specification for applications to route interoperable packetized content over any transport while protecting the privacy of those communications from network monitoring.

It is designed to be used as a low-level software library that can be embedded in any app.  It exposes *all* trust decisions to app layer, zero information or metadata is revealed to any network or endpoint without explicit instructions from the app.

All of the cryptographic primitives used in E3X are defined as a [Cipher Set](cs/), allowing for applications to select for different resource or security requirements as needed.

`E3X` defines asynchronous [messages][] and synchronous [channels][] managed using an [exchange][]. Each [exchange][] has mutual session state established through explicit [handshakes][].

An [exchange][] is created by combining keys for the local endpoint (one or more, depending on what Cipher Sets it supports) and has another endpoint's public key(s), the [exchange][] can then be used to create encrypted [messages][] and generate [handshakes][] in both directions.

Once the [handshakes][] have been received and verified, encrypted [channels][] can stream reliable or unreliable data between the two connected endpoints.  All data is encoded as [packets](../lob.md) both before (application layer) and after encryption (wire transport layer).

## Comparisons

These are similar low-level encrypted wire protocols:

* [OTR](http://en.wikipedia.org/wiki/Off-the-Record_Messaging), ([spec](https://otr.cypherpunks.ca/Protocol-v3-4.0.0.html))
* [CurveCP](http://curvecp.org)
* [QUIC](http://en.wikipedia.org/wiki/QUIC) ([spec](https://docs.google.com/document/d/1g5nIXAIkN_Y-7XJW5K45IblHd_L2f5LTaDUDwvZ5L6g/edit))
* [SRTP](http://en.wikipedia.org/wiki/Secure_Real-time_Transport_Protocol) ([spec](http://tools.ietf.org/html/rfc3711))
* [MinimaLT](https://www.ethos-os.org/~solworth/minimalt-20131031.pdf)

No existing protocols met the requirements for telehash to minimize all metadata revealed to any network while also supporting both the sync and async communication patterns.


[messages]: messages.md
[handshakes]: handshake.md
[channels]: channels.md
[exchange]: exchange.md

