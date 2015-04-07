UDP Transport
=============

Direct mapping, one packet to one message, always [cloaked](../e3x/cloaking.md).

Local port binding is dynamic (bind to `0`) unless given a specific port.  Implementations should support mapping the dynamic port via NAT-PMP and UPnP when possible.

Packets larger than the MTU may be fragmented by the router, but [chunking](../chunking.md) should not be used for UDP messages. packets larger than a low MTU should be dropped so that higher-level implementations can optimize the packet sizes and detect the MTU.


## Timeout

A new keepalive handshake should be automatically triggered when no packets have been sent for 30 seconds in order to keep any NAT mappings active.

## Discovery

UDP transports must always also listen on `*:42420` with broadcast enabled and also join the multicast address group `239.42.42.42` when available.

When discovery is enabled, the announcement packet(s) should be broadcast to the local LAN subnets port `42420` and the multicast group once every 10 seconds.

## Path JSON

Example [path](../channels/path.md) JSON for IPv4:

```json
{
    "ip": "192.168.0.55",
    "port": 42424,
    "type": "udp4"
}
```

Example [path](../channels/path.md) JSON for IPv6:

```json
{
    "ip": "fe80::bae8:56ff:fe43:3de4",
    "port": 42424,
    "type": "udp6"
}
```
