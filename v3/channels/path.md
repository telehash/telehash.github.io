# `path` - Network Path Information

Any endpoint may have multiple network interfaces, such as on a mobile device both cellular and wifi may be available simutaneously or be transitioning between them, and for a local network there may be a public IP via the gateway/NAT and an internal LAN IP. Any endpoint should always try to discover and be aware of all of the network paths it has available to send on (ipv4 and ipv6 for instance), as well as all of the paths that exist between it and any other endpoint. 
 
An unreliable channel of `"type":"path"` is the mechanism used to share and test any/all network paths available.  A path request may be generated automatically by any endpoint, based on an initial link, a new incoming path, a change in local network information, or application-specific signalling (e.g., a ping or connectivity validation request).

The initial request should contain an array of all of the paths the sender knows about itself, including local ones:

```json
{
    "c": 1,
    "type": "path",
    "paths": [
        {
            "url": "http://192.168.0.36:42424",
            "type": "http"
        },
        {
            "ip": "192.168.0.36",
            "port": 42424,
            "type": "udp4"
        },
        {
            "ip": "fe80::bae8:56ff:fe43:3de4",
            "port": 42424,
            "type": "tcp6"
        }
    ],
}
```

To handle a new `path` request, a response packet must be sent back to to every already known network path for the sender, as well as to any any new paths included in the request. The initiator should leave the channel open to receive any responses until the default timeout.  Every path response should include a `"path":{...}` where the value is the specific path information the response is being sent to.

```json
{
    "c": 1,
    "path": {
        "ip": "192.168.0.36",
        "port": 42424,
        "type": "udp4"
    }
}
```

<a name="paths" />
## Path Types

The information about an available network transport is encoded as a JSON object that contains a `"type":"..."` to identify which type of network it describes. The current path types defined are:

* `udp4` / `udp6` - [UDP](../transports/udp.md) over IPv4 or IPv6, contains `ip` and `port`, may be multiple (public and private ip's)
* `tcp4` / `tcp6` - [TCP](../transports/tcp.md) over IPv4 or IPv6, contains `ip` and `port` like UDP
* `http` - contains `url` which can be http or https, see [HTTP](../transports/http.md) for details
* `webrtc` - see [WebRTC](../transports/webrtc.md), ideal for browsers that have only HTTP support
* `peer` - contains `hn` which is sent [peer](peer.md) requests to provide routing assistance, optional [`uri`](../uri.md) if provided by the peer
