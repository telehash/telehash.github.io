### `"type":"connect"` - Connect to a hashname

The connect request is an immediate result of a `peer` request and must always attach/forward the same original BODY it as well as a [paths](#paths) array identifying possible network paths to it.  It must also attach a `"from":{...}` that is the [Cipher Set](cipher_sets.md) keys of the peer sender, identical format as to what is sent as part of an `open`:

```json
{
    "type": "connect",
    "c": 11,
    "from": {
        "1a": "851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6",
        "2a": "a5a741fa09b05baaead17fa9932e13cdafc7bcd39db1153fc6bbfe4614c063f3",
        "3a": "6dbc18961b45f026eb14c6606c1d6f71ce31040aae4f96a6bd0f3a84fce9af39"
    },
    "paths": [
        {
            "http": "http://192.168.0.36:53158",
            "type": "http"
        },
        {
            "ip": "192.168.0.36",
            "port": 61300,
            "type": "ipv4"
        }
    ]
}
```

The recipient can use the given public key to send an open request to the target via the possible paths.  If a NAT is suspected to exist, the target should have already sent a packet to ensure their side has a path mapped through the NAT and the open should then make it through.

When generating a connect, the switch must always verify the sending path is included in the paths array, and if not insert it in if it's a public path. This ensures that the recipient has at least one valid path and speeds up path discovery since no additional [`path`](#path) round trip such as for an IPv6 one.

The connect channel is left open to act as a temporary limited packet relay. The default inactivity timeout for the channel is the same as a peer, 30 seconds.

#### Connect Handling

The recipient of a connect is being asked to establish a line with the included hashname by a third party, and must be wary of the validity of such requests, both checking the included BODY against the `from` info to verify the hashname and matching CSID, as well as tracking the frequency of these requests to reduce outgoing unsolicited requests. There must be no more than one open packet sent per destination host per second.

The generated `open` should always be attached as a BODY and sent back in response on the new connect channel as well, which relays it back to the original `peer` request to guarantee connectivity (see below).

<a name="relay" />
### `peer <relay> connect` - Tunneling Packets

Over any established `peer` and `connect` channel all subsequent packets are tunneled between the two, with the BODY being received on one channel and attached verbatim as the BODY on a packet sent on the other channel.  This allows any two hashnames that are being introduced to have guaranteed connectivity for exchanging open packets to establish a line and any subsequent line packets to negotiate additional path information privately.

#### Rate Limit

The switch acting as the relay between a `peer` and `connect` must limit the rate of tunneled packets to no more than 5 per second in either direction, and never have more than one peer-connect pair active between two hashnames.  This enables the two hashnames to privately negotiate other connectivity, but not use it's bandwidth as an open bridge.

When any packets are being dropped the sender should be notified with a packet containing a `"warn":"..."` that includes a message meant only for logging and debugging of connection issues during development and testing.

#### Auto-Bridge

If this switch is willing to act as a bridge, as soon as it has detected a tunneled [line](network.md#line) in both directions it should internally set up a [bridge](#bridge) and always include a `"bridge":true` on every tunneled packet thereafter.  Either side of the tunnel when seeing this flag should then treat the channel's sending path as that of the tunneled packet, and subsequent line packets to that destination will be bridged to the other source.
