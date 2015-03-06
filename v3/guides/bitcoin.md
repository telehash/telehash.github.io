Bitcoin Integration Guide
=========================

> [DRAFT](https://github.com/telehash/telehash.org/labels/draft)

## Encrypted Peer Connections

High-level ideas on how to use telehash to encrypt connections to the bitcoin network:

* upon startup an endpoint should generate a new hashname to identify it to the network for that session
* if an endpoint has prior/OOB context of the keys to a known ip/port, it should attempt an encrypted connection first, and fallback to a traditional tcp socket
* when using a traditional tcp socket, an endpoint should embed its current hashname keys in base58 in its agent string
* when receiving keys in a user agent string, a new encrypted connection should be attempted and replace the current one
* TBD, add an encrypted bit to the advertised services so that its support is propogated
* TBD, show how to use a channel to send/receive messages in parallel over a link

## Hashname Pinning

When a hashname needs to be associated to a transaction it can be included as an `OP_RETURN` output by generating a random 8-byte nonce and processing the 32-byte hashname with the [ChaCha20 cipher](http://cr.yp.to/chacha.html).  The key input must be a common or private shared value used by the parties generating the transaction as well as validating it, as determined by the needs of the application.

The result is the 40 bytes for the `OP_RETURN` value, the 8-byte nonce followed by the 32-byte encrypted hashname.

This transaction acts as a reference that can be independently validated by anyone with the key input as a public lock to a single hashname.

## Chain of Custody

The blockchain may be used in combination with telehash to form a chain of custody from the bitcoin values/wallets to specific hashnames.  This is similar to pinning, but the hashnames in custody are always kept private and never recorded in the blochain.

* create an original genesis transaction that begins the chain of custody and serves as the parent fixture/reference id for all parties
* every transaction has only two outputs, the refund output and the custody output
* the custody output must be a P2SH with whatever associated value is relevant to the current chain

In order for any hashname to assert that it is in current custody of the chain to another, it must create and sign a valid new transaction that uses the most recent confirmed transaction's P2SH custody output as it's input, and a single `OP_RETURN` output of the 32-byte hash of the sender+recipient hashnames appended, with a `0` value associated so that the transaction cannot be accidentially broadcast (note: what is a better way to validate but prevent ever broadcasting?)

The recipient must fully validate the transaction, verify that the input(s) are correct and output hash is correct, as well as the chain of transaction input/outputs leads back to the shared genesis transaction.
