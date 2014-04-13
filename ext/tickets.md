# Tickets - Asynchronous Communication

A `ticket` is a single packet encrypted between two hashnames identically to an `open` as defined by their common [Cipher Set](cipher_sets.md).  The `line key` used to encrypt the open is ephemeral, generated for each ticket and must only be used once.

Tickets are:

* created specifically for a resolved hashname (must have it's CSID)
* never sent over a bare network (contain no addressing/identifiers)
* only be used in a context where the creating hashname is known
* never larger than 1024 bytes after encryption
* innner/unencrypted packet capacity varies by Cipher Set
* inner packet is not defined, usage depends on context

Tickets are only useful when two hashnames need to exchange data and are not online at the same time.  The [buffer](buffer.md) and [hashbook](hashbook.md) extensions are two services that cache tickets.