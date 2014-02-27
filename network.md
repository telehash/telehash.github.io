# Network Transport

![peers](./peers.png =500x)

Telehash can send packets over a variety of network transports, the preferred and most common of which is UDP since it is the most capable of enabling direct connections between peers.  All UDP messages map to a [packet](packet.md) 1:1 and can be sent/received over IPv4 or IPv6.

There are extensions describing how to also use other network transports:

* [HTTP](ext/path_http.md)
* [WebRTC](ext/path_webrtc.md)
* [Bluetooth](ext/path_bluetooth.md)
* [802.15.4](ext/path_802.15.4.md)
* [Local Area Network](ext/lan.md)

By default there are only two required packet types on any untrusted network transport, an [open](#open) and a [line](#line), both of which are encrypted by the selected [Cipher Set](cipher_sets.md) so that only the sender/recipient can read them. Additional packet types may be supported on specific network transports relating to functionality in those networks such as broadcast discovery and routing.

When working with multiple transports a switch often needs to send and receive current network addressing details. Each specific active network address is called a `path` and there is a common [JSON](#paths) format for exchanging paths.

<a name="open" />
## `open` - Establishing a Line

A packet read from the network that has a HEAD of length 1 is always an `open`, with the single HEAD byte being the CSID used by the sender.

The BODY is the encrypted binary that only that selected [Cipher Set](cipher_sets.md) can process into an "inner" packet. Here's an example of the JSON content of this decrypted inner packet:

```js
{
    "from":{"2a":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"},
    "at":1375983687346,
    "line":"8b945f90f08940c573c29352d767fee4"
}
```

The inner packet's required values are defined as:

   * `from` - the fingerprints of the public keys defining the sending hashname, called it's `parts`
   * `line` - the unique id the recipient must use for sending any line packets, 16 random bytes lower case hex encoded
   * `at` - an integer timestamp of when the line was initiated, used to verify another incoming open request is newer based on the last received `at`

The inner packet must also contain a BODY that is the binary `key` for the Cipher Set being used.

An `open` is always triggered by the creation of a channel to a hashname, such that when a channel generates it's first packet the switch recognizes that a line doesn't exist yet.  The initiating channel logic is internally responsible for any retransmission of it's own packets, and those retransmissions are the source of re-triggering the sending of any `open` requests.

When a new line is initiated the switch must also store a local timestamp at that time and send that same value as the `at` in any subsequent open request for that line.  This enables the recipient to recognize retransmissions of the same line initiation request, as well as detect when an open is generated for a new line as it will have a newer `at` value relative to the existing one. Any subsequent opens with matching or older `at` values must be ignored.

A switch may have an existing line but believe that the recipient might not have the line open anymore (such as if it reset, has been idle more than 60 seconds, or there's a new incoming `connect` from the other hashname, etc). In this state it should re-send the same open packet for the current line again, allowing the recipient to re-open the line if so.

If a new open request is validated and there's an existing line, when the new open contains a new `line` id then the recipient must reset all existing channels and any session state for that hashname as it signifies a complete reset/restart.  If the new open contains the same/existing line id as a previous one, it is simply a request to recalculate the line encryption keys but not reset any existing channel state.

<a name="line" />
## `line` - Packet Encryption

A packet read from the network that has a HEAD of length 0 is a binary encrypted `line` packet.  The first 16 bytes are always the line ID, and only known line IDs are processed, any packet with an unknown ID is dropped.  The remaining bytes are encrypted and processed by the [Cipher Set](cipher_sets.md) used to create the line.

Once decrypted, the resulting value is always a [channel](channels.md) packet.

Often a switch may be acting as a [bridge](switch.md#bridge) where it maps line IDs to other network destinations and doesn't attempt to process/decrypt them.

<a name="paths" />
### Network Paths

To enable the most direct P2P connectivity possible the default network transport between any two switches is UDP.  Additional transports are defined below for when UDP is not supported or as a fallback if it's blocked.  All UDP packets map 1:1 to a Telehash packet.

Every unique network sender/recipient is called a `path` and defined by a JSON object that contains a `"type":"..."` to identify which type of network information it describes. The current path types defined are:

* `ipv4` - UDP, contains `ip` and `port`, default and most common path
* `ipv6` - UDP, contains `ip` and `port`, preferred/upgraded when both sides support it
* `http` - see [HTTP](ext/path_http.md), also is the primary fallback when UDP is blocked
* `webrtc` - see [WebRTC](ext/path_webrtc.md), preferred when possible
* `relay` - contains `id` of the channel id to create a [relay](switch.md#relay) with
* `bridge` - see [bridge](switch.md#bridge), fallback when no other path works

These paths are used often within the protocol to exchange network information, and frequently sent as an array, for example:

```js
[{
  "type": "ipv4",
  "ip": "127.0.0.1",
  "port": 42424
}, {
  "type": "ipv6",
  "ip": "fe80::2a37:37ff:fe02:3c22",
  "port": 42424
}, {
  "type": "http",
  "http": "http://127.0.0.1"
}]
```

