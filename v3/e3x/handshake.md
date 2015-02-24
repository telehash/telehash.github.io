# Handshake - Mutual Exchange Creation

A handshake is one or more encrypted [messages](messages.md) sent between two endpoints in order to validate their identity and establish a mutual session to use for [channels](channels.md).  At a minimum at least one handshake message must be both sent and received in order for the session to be created, with both endpoints verifying that it is always the most current one.

Applications may send or expect more than one handshake message for additional authentication and authorization requirements beyond the basic endpoint key exchange. New handshakes are also triggered automatically for existing sessions as needed by the transport(s) in use to verify that the network paths are still valid and/or maintain any NAT mappings.

The resulting size of encrypted handshake packets vary by which [Cipher Sets](cs/) are used combined with the type of inner packet, typically it ranges from ~70 to ~1100 bytes.

## Resend/Timeout

After a new handshake is generated and delivered it should be resent verbatim at 1 second, 3 seconds, 8 seconds, and again at 20 seconds unless there is a valid handshake response.  After 30 seconds with no response the exchange should be timed out, considered invalid and all related state removed.

At any point the transport being used to deliver packets may generate a keepalive handshake request which will start this process.

## Message Types

Any decrypted handshake message is identified with a `"type":"..."` string value, that if not included in the header must be defaulted to the type of `"key"`.  Only one unique type may exist concurrently (same `at` value) with any handshake process.

### "key" (default)

The message must attach the [packet encoding](cs/#packet) of the sender's keys as the BODY.

### "jwt"

The message is a [JSON Web Token](../guides/jose.md#jwt) encoded packet.

### "uri"

A [URI](../uri.md) was used to generate this handshake and it is included as the `"uri":"..."` value.

### "tx"

A [bitcoin transaction](../guides/bitcoin.md) is attached as the `BODY` to validate this handshake.


## Sequencing with `at`

All decrypted handshake messages must contain an `"at":123456` with a 64 bit positive unsigned integer value to determine the newest generated handshake from either endpoint.  There is no requirement for the `at` value to be the current time, in sync, or accurate, only that it increases on all subsequent handshakes in the future from the last highest known value.

Multiple messages as part of one handshake must all have the same `at` value and different types, only one message per type with the highest `at` is used.

The `at` value determines if an incoming handshake is the most current and if the recipient needs to respond.  The last bit in the `at` must always match the [order](order.md) value of the sender, if they are `ODD` it must be a 1 (and 0 if they are `EVEN`) to guarantee that no two endpoints can choose the same `at` independently.

When an `at` is received that is higher than one sent, new handshake message (or messages) must be returned with that matching highest `at` value in order to inform the sender that their handshake is confirmed.  Upon receiving and confirming a new `at`, any pending channel packets that may have been waiting to send may be flushed/delivered.

When first creating a handshake, the sender should make every effort to always choose a higher `at` than any they may have sent in the past.  Most can just use local [32-bit epoch](http://en.wikipedia.org/wiki/Unix_time) as this value, but when not available (embedded systems) they should locally store the last sent `at` and always increase it.

If the maximum `at` value is ever reached/used the two hashnames cannot send any more subsequent handshakes and will no longer be able to communicate, either side must generate a new hashname to start over.

## Routing Token

The handshake determines the exchange's `ROUTING TOKEN` value, which must always be the first 16 bytes of the encrypted outer message `BODY`.  The `ROUTING TOKEN` is not used cryptographically and is only a unique value to assist the two endpoints and any routing parties on mapping to a known exchange session.

Each [Cipher Set](cs/) must structure their messages such that the first 16 bytes of the `BODY` are unique and remain stable for the lifetime of the exchange, typically being the exchange's public key bytes.

Any handshake with a different `ROUTING TOKEN` and a higher `at` of an existing exchange for the same endpoint must clear any cached handshake messages or state stored for that exchange.

## Handling Multiple Messages

Immediately upon receiving a valid higher or equal `at` for any handshake message type, that message should be cached and replace any previous matching type with a _lower_ `at` only (messages with matching `at` and `type` values must be discarded).  The message should also then be grouped with any other received messages with the same `at` and delivered to the application to process and validate.

If an application requires multiple message types it simply waits until the sufficient types arrive and process/validate them.  Application-invalidated handshakes must never be responded to so that the endpoint does not advertise its existence except to explicitly trusted/validated endpoints.

At any point the application may provide updated handshake message types to be sent in a new handshake process.  When the transport requests an updated handshake, the last known/provided message types are updated with a new `at` and re-sent.
