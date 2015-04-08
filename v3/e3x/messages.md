# Messages - Asynchronous Content Transport

Message packets are for encrypting small amounts of content to other entities without requiring a synchronized [exchange](exchange.md), such that the recipient can process them at any point in the future.  They are used primarily for creating ephemeral [handshakes](handshake.md) to establish synchronous [channel](channels.md) encryption with forward secrecy guarantees.

Content sent in a message has a lower level of privacy since there is no forward secrecy protection like channels provide, if the recipient is compromised any past messages sent to it can be decrypted.  Messages should only be used minimally for temporary or non-secret data, all private or sensitive content should be sent over channels.  Messages should also never be stored at rest, logged, or archived.

Messages define how to encrypt the packets but have no required internal structure (unlike channels).  There is a larger overhead for encrypted message packets as they must always include the ephemeral public key information used and often require additional computation as well.

An [exchange](exchange.md) may be created on demand just to generate/process one or more messages and not used for channels, but since messages are asynchronous they do not require the exchanges to be in sync to operate.

The size of an encrypted message is determined by the application and context in which it is used, handshakes are usually small (<1400 bytes to maximize transport compatibility) and any messages intended to be sent over a transport with a low MTU may need to use [chunked encoding](../chunking.md) as the BODY of multiple messages.

## Packet Encryption

All message packets are encrypted using a cipher as determined by the [Cipher Set](cs/) in use for the exchange.  The encrypted (OUTER) packets must have a `HEAD` of length 1 to identify the CSID and the encrypted contents as the binary `BODY`.

Once decrypted they result in an INNER packet with a structure that is determined entirely by the application.  It is common practice for applications to use a `"type":"value"` on the INNER JSON similarly to channel packets, but not required.  All INNER packets should contain a mechanism for the recipient to determine recency and thus ensure that the ephemeral keys already used can be invalidated and not-reused if required for forward secrecy.

## Stable Prefix

All message packets generated from one exchange must have at least the first 16 bytes remain fixed for the lifetime of that exchange to be used for generating the [`ROUTING TOKEN`](handshake.md#token) and validation caching.

