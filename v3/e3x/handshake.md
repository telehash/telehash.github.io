# Handshake - Mutual Exchange Creation

A handshake must be both sent and received in order for an exchange to be created, and both endpoints must know that they have the current one by verifying it's contents against what they've sent.

New handshakes are also triggered automatically for existing exchanges as needed by the transport(s) in use to verify that the network paths are still valid or maintain any NAT mappings.

## Inner Packet

The `INNER` is the [packet encoding](cs/#packet) of the sender's keys.

The JSON must also include an `"at":123456` with a 32 bit unsigned integer value that represents the approximate time the sender generated the handshake.  There is no requirement for this time to be in sync or accurate, only that it increases on all subsequent handshakes in the future.

The `at` value determines if an incoming handshake is the most current and if the recipient needs to respond.  The last bit in the `at` must always match the [order](order.md) value of the sender, if they are `ODD` it must be a 1 (and 0 if they are `EVEN`) to guarantee that no two endpoints can choose the same `at` independently.

When an `at` is received that is higher than one sent, a new handshake must be returned with that matching highest `at` value in order to inform the sender that their handshake is confirmed.  Upon receiving and confirming a new `at`, any pending channel packets that may have been waiting to send may be flushed/delivered.

When first creating a handshake, the sender should make every effort to always choose a higher `at` than any they may have sent in the past.  Most can just use local [epoch](http://en.wikipedia.org/wiki/Unix_time) as this value, but when not available (embedded systems) they should locally store the last sent `at` and always increase it.

## Token

The handshake determines the exchange's routeable `TOKEN` value, which must always be 16 bytes of the temporary public key representation.  The `TOKEN` is not used cryptographically and is only a unique value to assist the two endpoints and any routing parties on mapping to a known exchange.

Each [Cipher Set](cs/) must structure their handshake such that the first 16 bytes of the `BODY` are the `TOKEN`.
