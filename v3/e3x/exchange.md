# Exchange - Endpoint Encryption State

An `exchange` is the name of the current encryption state to one remote endpoint, a pairing between the local endpoint's private key and the remote endpoint's public key.

When a new `exchange` is created it will generate a unique public [ROUTING TOKEN](handshake.md#token) value for that current instance, any incoming encrypted channel packets with that matching value can then be delivered to the appropriate `exchange`.

The `exchange` is used to generate and process all [messages](messages.md), [handshakes](handshake.md), and [channels](channels.md).  It can only generate channel packets after it has processed at least one handshake from the remote endpoint to set up the required synchronous encryption state.

An `exchange` internally keeps track of the current/best `at` value for the handshakes, validates incoming channel IDs, and generates new outgoing channel IDs.
