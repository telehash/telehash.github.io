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
* [cloaking](cloaking.md) - randomize all bytes on the wire

An `endpoint` generates local keys to uniquely identify itself (one or more keys, depending on what Cipher Sets it supports), and requires another endpoint's public key(s) to create an `exchange` to it. The exchange can then be used to create encrypted `messages` and generate `handshakes` in both directions.  Once the handshakes have been received and verified, encrypted `channels` can stream reliable or unreliable data between the two connected endpoints.  All data is encoded as `packets` both before (app layer) and after encryption (wire transport layer).

## Comparisons

These are similar low-level encrypted wire protocols:

* [OTR](http://en.wikipedia.org/wiki/Off-the-Record_Messaging), ([spec](https://otr.cypherpunks.ca/Protocol-v3-4.0.0.html))
* [CurveCP](http://curvecp.org)
* [QUIC](http://en.wikipedia.org/wiki/QUIC) ([spec](https://docs.google.com/document/d/1g5nIXAIkN_Y-7XJW5K45IblHd_L2f5LTaDUDwvZ5L6g/edit))
* [SRTP](http://en.wikipedia.org/wiki/Secure_Real-time_Transport_Protocol) ([spec](http://tools.ietf.org/html/rfc3711))

## Implementations

* [JavaScript](https://github.com/telehash/e3x-js)
* [C](https://github.com/telehash/telehash-c/blob/master/src/e3x.h)
* [Go](https://github.com/telehash/gogotelehash/tree/master/e3x)
* [C#](https://github.com/telehash/telehash.net/tree/master/Telehash.Net/E3X)


|              | base | reliable | cloaking | 1a | 1b | 1c | 2a | 2b | 3a |
|:------------:|:----:|:--------:|:--------:|:--:|:--:|:--:|:--:|:--:|:--:|
|    node.js   |   ✓  |     ✓    |     ✓    |  ✓ |    |    | ✓ |    | ✓ |
| browser js   |   ✓  |     ✓    |     ✓    |  ✓ |    |    | ✓ |    |   |
|   c - unix   |   ✓  |    ✓    |     ✓    |  ✓ |    |    | ✓ |    | ✓ |
| c - embedded |   ✓  |    ✓    |     ✓    |  ✓ |    |    |    |    |    |
|      go      |   ✓  |     ✓    |          |  ✓ |    |    |    |    |    |
|      c#      |   ✓  |         |          |  ✓ |    |    | ✓ |    |    |

## API 

The interface to use e3x is designed to minimize any accidential leakage of information by having a small explicit API.

Implementations may vary depending on their platform/language but should strive for a similar common pattern of interaction and method/data language as documented here at a high level.

All implementations will require a strong/secure random number generator to properly support all aspects of this API and the underlying ciphers/algorithms.

### `generate`

Create a new set of public and private keys for all supported Cipher Sets.

### `self(keypairs)`

Load a given set of public/secret keys to create a local endpoint state.

* `decrypt(message)` - take an enecrypted message received from a wire transport, return a decrypted [packet](../lob)

### `exchange(self, public keys)`

Load a given set of another endpoint's public keys to create an exchange state object between the `self` and that endpoint.

* `token` - 16 byte ephemeral exchange identifier
* `verify(message)` - validate that this message was sent from this exchange
* `encrypt(packet)` - return encrypted message to this endpoint
* `handshake(at)` - return a handshake with the given at value
* `sync(handshake)` - process incoming handshake, returns current at value
* `receive(channel)` - process/validate an incoming encrypted channel packet, return decrypted packet

### `channel(exchange, open)`

Requires an exchange that has sent/received a handshake and is in sync.

* `id` - unique numeric id
* `state` - current state of the channel (`ENDED`, `OPENING`, `OPEN`)
* `timeout` - get/set the current timeout value of this channel
* `send(packet)` - return encrypted channel packet
