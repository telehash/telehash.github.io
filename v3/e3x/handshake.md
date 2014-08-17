# Handshake - Mutual Exchange Creation

A handshake must be both sent and received in order for an exchange to be created, and both endpoints must know that they have the current one by verifying it's contents against what they've sent.

New handshakes are also triggered automatically for existing exchanges as needed by the transport(s) in use to verify that the network paths are still valid or maintain any NAT mappings.

## Inner Packet

The `INNER` packet encrypted in a handshake must include the sender's binary public key as the `BODY` of that packet.

The `JSON` may optionally include [compact](../hashname/#compact) values if there are additional keys representing this endpoint, otherwise the packet will have a `HEAD` of 0 if there is only one key.

## Sequence Value

Every handshake must include a `SEQ` integer that is 4 bytes in network order, this sequence value determines if the handshake is the most current and if the recipient needs to respond.  The last bit in the `SEQ` must always match the [order](order.md) value of the sender, if they are `HIGH` it must be a 1 (and 0 if they are `LOW`) to guarantee that no two endpoints can choose the same `SEQ` independently.

When a `SEQ` is received that is higher than one sent, a new handshake must be returned with that matching highest `SEQ` value in order to inform the sender that their handshake is confirmed.  Upon receiving and confirming a new `SEQ`, any pending channel packets that may have been waiting to send may be flushed/delivered.

When first creating a handshake, the sender should make every effort to always choose a higher `SEQ` than any they may have sent in the past.  Most can just use local [epoch](http://en.wikipedia.org/wiki/Unix_time) as this value, but when not available (embedded systems) they should locally store the last sent `SEQ` and always increase it.

## Token

The handshake determines the exchange's routeable `TOKEN` value, which must always be 16 bytes of the temporary public key representation.  The `TOKEN` is not used cryptographically and is only a unique value to assist the two endpoints and any routing parties on mapping to a known exchange.

Each [Cipher Set](cipher_sets.md) must structure their handshake such that the first 16 bytes of the `BODY` are the `TOKEN`.
