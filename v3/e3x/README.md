e3x - End-to-End Encrypted eXchange
===================================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

This is the definition of a flexible end-to-end encrypted exchange, specifying a compatible way for applications to route packetized content over any transport while protecting the privacy of those communications from any network monitoring.

Designed to expose all trust decisions to app layer, zero information or metadata is revealed to anything without explicit instructions from the app.

## Index

* [packet](../lob/)
* [Cipher Set](cipher_sets.md) (CS)
* [message](messages.md)
* [handshake](handshake.md) - a type of message
* [channel](channels.md)
* endpoint - one or more generated CS keys to identify a local instance
* exchange - created by combining a local and remote endpoint and one ephemeral CS key for the exchange

An endpoint creates an exchange to another endpoint, generating handshakes (which are special purpose encrypted messages) in both directions.  Once the handshakes have been verified, encrypted channels can be sent/received using an exchange between the two endpoints.  Everything is encrypted with a specific Cipher Set defining the public key and streaming cipher algorithms, and all data is encoded as packets before and after encryption.

## API

The interface to use e3x is designed to minimize any accidential leakage of information by any usage of it.  Implementations may vary depending on their platform/language, but should strive for a similar common pattern of interaction.

[E3X API](https://github.com/telehash/telehash-c/blob/master/src/e3x.h)

