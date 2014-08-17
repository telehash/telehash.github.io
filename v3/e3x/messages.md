# Messages - Asynchronous / Offline Content Transport

Message packets are for when one endpoint is unable to establish a channel to another and has a mechanism to send content for the other endpoint to receive independently such that both don't need to be online at the same time.

Messages define how to encrypt the packets but have no required internal structure (unlike channels).  There is more size overhead for encrypted message packets as they must always include the temporary public key information used, and it may be different for each one requiring additional expensive compute as well.

An exchange may be used to generate one or more messages as needed and can be created as needed to process incoming ones, but messages are asynchronous and do not need the same exchanges on either side to be handled.

All [handshakes](handshake.md) are message packets.

## Packet Encryption

All message packets are encrypted using a cipher as determined by the [Cipher Set](cipher_sets.md) in use for the exchange.  The encrypted (OUTER) packets must have a `HEAD` of length 1 to identify the CSID and the encrypted contents as the binary `BODY`.

Once decrypted they result in an INNER packet with a structure that is determined entirely by the application.  It is common practice for applications to use a `"type":"value"` on the INNER JSON similarly to channel packets, but not required.
