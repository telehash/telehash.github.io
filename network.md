<a name="paths" />
### Network Paths

To enable the most direct P2P connectivity possible the default network transport between any two switches is UDP.  Additional transports are defined below for when UDP is not supported or as a fallback if it's blocked.  All UDP packets map 1:1 to a Telehash packet.

Every unique network sender/recipient is called a `path` and defined by a JSON object that contains a `"type":"..."` to identify which type of network information it describes. The current path types defined are:

* `ipv4` - UDP, contains `ip` and `port`, default and most common path
* `ipv6` - UDP, contains `ip` and `port`, preferred/upgraded when both sides support it
* `http` - see [path_http][], also is the primary fallback when UDP is blocked
* `webrtc` - see [path_webrtc][], preferred when possible
* `relay` - contains `id` of the channel id to create a [relay](#relay) with
* `bridge` - see [ext_bridge][], fallback when no other path works

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

## Packet types
When a packet is being processed from the network initially, it's
JSON must contain a `type` field with a string value of `open` or
`line`, each of which determine how to process the BODY of the packet:

 * [`open`](#open) - this is a request to establish a new encrypted session
 * [`line`](#line) - this is an encrypted packet for an already established session

<a name="open" />
### `open` - Establishing a Line

A packet of `"type":"open"` is used to establish a temporary encrypted
session between any two hashnames, this session is called a "line". You must know a public key of the recipient in order to send an `open` packet to them. The detailed requirements to create/process open packets are defined by the [Cipher Set](cipher_sets.md) being used between two hashnames.

The BODY of the open packet will be a binary encrypted blob, once decrypted by the process defined in the Cipher Set that is being used, it will contain another "inner" packet. Here's an example of the JSON content of this inner packet before encryption:

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
### `line` - Packet Encryption

As soon as any two hashnames have both send and received a valid `open` then a line is created between them. Since one part is always the initiator and sent the open as a result of needing to create a channel to the other hashname, immediately upon creating a `line` that initiator will then send line packets.

Every `"type":"line"` packet is required to have a `line` parameter that matches the outgoing id sent in the open, unknown line ids are ignored/dropped.  The BODY is always an encrypted binary that is defined by the encryption/decryption used in the given [Cipher Set](cipher_sets.md).

Once decrypted, the resulting value is a packet that must minimally contain a "c" value as defined below to identify the channel the packet belongs to.