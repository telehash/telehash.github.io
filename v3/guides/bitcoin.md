Bitcoin Integration Guide
=========================

> This is a work-in-progress

This is a guide on how to use telehash to encrypt connections to the bitcoin network.

* upon startup an endpoint should generate a new hashname to identify it to the network for that session
* if an endpoint has prior/OOB context of the keys to a known ip/port, it should attempt an encrypted connection first, and fallback to a traditional tcp socket
* when using a traditional tcp socket, an endpoint should embed its current hashname keys in base58 in its agent string
* when receiving keys in a user agent string, a new encrypted connection should be attempted and replace the current one
* TBD, add an encrypted bit to the advertised services so that its support is propogated
* TBD, show how to use a channel to send/receive messages in parallel over a link

### Other Uses

* encode relevant hashname(s) in the output of any transaction by embedding its 32 bytes in a `OP_RETURN` value
* create a transaction and attach it to a handshake/link to identify the sender as the owner of the transaction's input (for validation)
