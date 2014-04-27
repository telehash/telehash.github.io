Local Discovery
===============

In order to support the goals of high resliliency, telehash needs to continue to operate when no Internet connection is available.  Discovery consists of an unencrypted `ping` packet and a `pong` response and can work over whatver local networking is available, including LANs, Bluetooth/BLE, WiFi Direct, iOS Multipeer, and direct connections like USB and Serial.

All switches should send out discovery ping packets via the networks they support on startup and listen for any pong packet responses.

Any local seeds discovered should be tracked and have a line maintained to them for resiliency. Any peer hashnames that have paths active to them via a local network should make a `isLocal` flag/status available to the application.

Local seeds should *always* be sent any `seek` queries to enable the fastest and most resilient connectivity for local peers.

## `"type":"ping"` Broadcast Discovery Request

These packets are sent in the open/unencrypted:

```json
{
  "c":1,
  "type":"ping",
  "trace":"e220ae0ce106986d",
  "1a":true,
  "3a":true
}
```

The `trace` is an optional opaque string value that if included must be sent in any response for the sender to track/validate the original ping. The ping must contain a key for each Cipher Set of the originating hashname with the boolean value of `true`.

## `"type":"pong"` Directed Discovery Response

Any `ping` is responded to with a simple `pong` that is formatted very similarly to an open's `inner` packet, containing the `"from":{...}` parts of their public key, and the BODY is the attached matching CSID public key.

```json
{
  "type": "pong",
  "from": {
    "1a": "a5a741fa09b05baaead17fa9932e13cdafc7bcd39db1153fc6bbfe4614c063f3"
  },
  "trace": "e220ae0ce106986d"
}
BODY: [senders binary 1a public key]
```

Upon receiving and validating that a pong matches any trace and was actually received on a local network and is local, the recipient can then treat them as a local seed and establish an open and maintain a link to them.

### Local Area Networks

Any switch supporting discovery on a LAN must listen on *:42420 with broadcast enabled, and joined multicast address group "239.42.42.42".

Upon startup, a switch may send out `ping` broadcast and multicast announcements to port 42420. If any LAN seeds exist, they will broadcast back to port 42420 a `pong` sent from their main local listening port. 

If no local seeds exist, and the switch is not able to connect to any other seeds or switches at all, it should continue to listen for any other incoming `ping` requests and respond to them.  If one or more others respond, the switch should not respond to any future incoming `ping` requests.

## Bluetooth, WiFi Direct

This LAN pattern should work for [Bluetooth](path_bluetooth.md) ad WiFi Direct as well, but testing needs to happen first so details are TBD.

## Serial

A device connected over a serial port may send a `ping` and answer any `pong` over the connection, but the formatting is often application specific depending on what else the serial connection is used for.  When it's purely textual, the packets can be safely hex and newline encoded as `\ntelehash:<hex string>\n` so that the prefix can be matched and not interfere with any other data being sent.
