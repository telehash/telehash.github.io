e3x - End-to-End Encrypted eXchange
===================================

This is the definition of a flexible end-to-end encrypted exchange wire protocol, specifying a compatible way for applications to route packetized content over any transport while protecting the privacy of those communications from any network monitoring.

It is designed to be used as a low-level software library that can be embedded in any app.  It exposes *all* trust decisions to app layer, zero information or metadata is revealed to any network or endpoint without explicit instructions from the app.

## Index

* [packet](../lob/) - all binary and JSON data encoding/encapsulation
* [Cipher Sets](cs/) - asynchronous and streaming encryption, multiple keys
* [message](messages.md) - an asynchronous encrypted packet between two endpoints
* [handshake](handshake.md) - a type of message used to establish a streaming encryption session for channels
* [channel](channels.md) - small (max 1400 bytes) synchronous encrypted packets, proxies larger reliable and unreliable data streams

An `endpoint` generates local keys to uniquely identify itself (one or more keys, depending on what Cipher Sets it supports), and requires another endpoint's public key(s) to create an `exchange` to it. The exchange can then be used to create encrypted `messages` and generate `handshakes` in both directions.  Once the handshakes have been received and verified, encrypted `channels` can stream reliable or unreliable data between the two connected endpoints.  All data is encoded as `packets` both before (app layer) and after encryption (wire transport layer).

## Comparisons

These are similar low-level encrypted wire protocols:

* [OTR](http://en.wikipedia.org/wiki/Off-the-Record_Messaging), ([spec](https://otr.cypherpunks.ca/Protocol-v3-4.0.0.html))
* [CurveCP](http://curvecp.org)
* [QUIC](http://en.wikipedia.org/wiki/QUIC) ([spec](https://docs.google.com/document/d/1g5nIXAIkN_Y-7XJW5K45IblHd_L2f5LTaDUDwvZ5L6g/edit))

## Implementations

* [JavaScript](https://github.com/telehash/e3x-js)
* [C](https://github.com/telehash/telehash-c/blob/master/src/e3x.h)
* [Go](https://github.com/telehash/gogotelehash/tree/master/e3x)

## API 

The interface to use e3x is designed to minimize any accidential leakage of information by any usage of it.  Implementations may vary depending on their platform/language, but should strive for a similar common pattern of interaction.

### `generate`

Create a new set of public and private keys for all supported Cipher Sets.

### `self`

Load a given set of public/private keys to create a local endpoint state.

* `decrypt(message)` - take an enecrypted packet received from a wire transport, return a decrypted packet

### `exchange`

Load a given set of another endpoint's public keys to create an exchange state object between the `self` and that endpoint.

* `token` - 16 byte ephemeral exchange identifier
* `verify(message)` - validate that this message was sent from this exchange
* `encrypt(packet)` - return async-encrypted message to this endpoint
* `handshake` - return a current handshake
* `sync(handshake)` - process incoming handshake
* `receive(channel)` - process an incoming sync-encrypted channel packet

### `channel`

Requires an exchange that has sent/received a handshake and is in sync.

* `id` - unique numeric id
* `send(packet)` - return sync-encrypted packet on this channel
