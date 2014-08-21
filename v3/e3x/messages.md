# Messages - Asynchronous / Offline Content Transport

Message packets are for when one endpoint is unable to establish a channel to another and has a mechanism to send content for the other endpoint to receive independently such that both don't need to be online at the same time.

Messages define how to encrypt the packets but have no required internal structure (unlike channels).  There is more size overhead for encrypted message packets as they must always include the temporary public key information used, and it may be different for each one requiring additional expensive compute as well.

An exchange may be used to generate one or more messages as needed and can be created as needed to process incoming ones, but messages are asynchronous and do not need the same exchanges on either side to be handled.

All [handshakes](handshake.md) are message packets.

## Packet Encryption

All message packets are encrypted using a cipher as determined by the [Cipher Set](cs/) in use for the exchange.  The encrypted (OUTER) packets must have a `HEAD` of length 1 to identify the CSID and the encrypted contents as the binary `BODY`.

Once decrypted they result in an INNER packet with a structure that is determined entirely by the application.  It is common practice for applications to use a `"type":"value"` on the INNER JSON similarly to channel packets, but not required.

The [handshakes](handshake.md) messages have an INNER that contains the sending endpoint's public key for the CSID used so that the sender identity can be immediately validated.

## Sequence Value

All message packet `BODY` values must begin with a 4-byte network order `SEQ` value, this is important for the application to indicate message ordering and priority.  This value is also used and validated internally by the Cipher Set (usually for the IV/nonce).

## Tokens

All message packets generated from one exchange will have at least 16 bytes following the `SEQ` value that remain fixed for the lifetime of that exchange to be used for network routing and validation caching.  These 16 bytes are SHA-256 hashed into a 32 byte digest in order to remove any CSID uniqueness, and then the first 16 bytes of the digest are used as the official `TOKEN` value to match future message or channel packets from that exchange.

