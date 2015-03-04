# Messages - Asynchronous / Offline Content Transport with Forward Secrecy

Message packets are for encrypting small amounts of content to other entities without requiring a synchronous exchange, such that the recipient can process them at any point in the future.  They are used primarily for creating handshakes to establish synchronous [channel](channels.md) encryption that has forward secrecy guarantees, as messages alone provide a lower level of privacy and should only be used for temporary or non-secret data and never stored at rest.

Messages define how to encrypt the packets but have no required internal structure (unlike channels).  There is a larger overhead for encrypted message packets as they must always include the ephemeral public key information used and often require additional computation as well.

An exchange may be created on demand just to generate/process one or more messages and not used for channels, but since messages are asynchronous they do not require the exchanges to be in sync to operate.

All [handshakes](handshake.md) are message packets.

The size of an encrypted message is determined by the application and context in which it is used, handshakes are usually small (<1400 bytes to maximize transport compatibility) and any messages intended to be sent over a transport with a low MTU may need to use [chunked encoding](../chunking.md) as the BODY of multiple messages.

## Packet Encryption

All message packets are encrypted using a cipher as determined by the [Cipher Set](cs/) in use for the exchange.  The encrypted (OUTER) packets must have a `HEAD` of length 1 to identify the CSID and the encrypted contents as the binary `BODY`.

Once decrypted they result in an INNER packet with a structure that is determined entirely by the application.  It is common practice for applications to use a `"type":"value"` on the INNER JSON similarly to channel packets, but not required.  All INNER packets should contain a mechanism for the recipient to determine recency to ensure that the ephemeral keys already used can be invalidated and not-reused if required for forward secrecy.

The [handshakes](handshake.md) messages have an INNER that contains the sending endpoint's public key for the CSID used so that the sender identity can be immediately validated.

## Tokens

All message packets generated from one exchange will have at least the first 16 bytes remain fixed for the lifetime of that exchange to be used for network routing and validation caching.  These 16 bytes are SHA-256 hashed into a 32 byte digest in order to remove any CSID uniqueness, and then the first 16 bytes of the digest are used as the official `TOKEN` value to match future message or channel packets from that exchange.

