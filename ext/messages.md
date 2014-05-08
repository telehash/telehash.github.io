# Messages - Asynchronous Communication

> This is a **rough draft** and a work in progress

A `message` is a single packet encrypted between two hashnames identically to an `open` as defined by their common [Cipher Set](cipher_sets.md).  The `line key` used to encrypt the open is ephemeral, generated for each message and must only be used once.

In order to generate a message, the recipient hashname must have been resolved, the sender must know the recipient's matching CSID key in order to encrypt the message.

Messages are:

* primarily useful when two hashnames need to exchange data and are not online at the same time
* created specifically for a resolved hashname (must have it's CSID)
* inner packet is not defined, it's structure is entirely up to applications to define
* method for sending/receiving is application defined
* can be sent/received over a [box](box.md) channel

