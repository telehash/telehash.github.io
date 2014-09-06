### `"type":"path"` - Network Path Information

Any switch may have multiple network interfaces, such as on a mobile device both cellular and wifi may be available simutaneously or be transitioning between them, and for a local network there may be a public IP via the gateway/NAT and an internal LAN IP. A switch should always try to discover and be aware of all of the networks it has available to send on (ipv4 and ipv6 for instance), as well as what network paths exist between it and any other hashname. 
 
An unreliable channel of `"type":"path"` is the mechanism used to share and test any/all network paths available.  Whenever a new line is created to or from any hashname, a `path` request is sent over the network interface the open was received/sent on.  A `path` may also be sent if a switch detects local network information has changed in order to discover it's current public IP/Port from the response in case it's behind a NAT.

The initial request should contain an array of all of the known paths the sender knows about itself, including local ones if it believes the recipient is also local:

```json
{
    "c": 1,
    "type": "path",
    "paths": [
        {
            "http": "http://192.168.0.36:42424",
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

To handle a new `path` request, a response packet must be sent back on the same channel via every included or already known path.  The initiator should leave the channel open for up to 10 seconds to receive any responses, and can use all of the incoming paths that responded to select a default/primary path for the hashname.  Every path response should include a `"path":{...}` where the value is the specific path information the response is being sent to.

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

#### Path Detection / Handling

There are two states of network paths, `possible` and `established`.  A possible path is one that is suggested from an incoming `connect` or one that is listed in a `paths` array, as the switch only knows the network information from another source than that network interface itself.  Possible paths should only be used to send open packets and `path` responses and not trusted as a valid destination for a hashname beyond that.

An established path is one that comes from the network interface, the actual encoded details of the sender information.  When any `open` or `line` is received from any network, the sender's path is considerd established and should be stored by the switch as such so that it can be used as a validated destination for any outgoing packets.  When a switch detects that a path may not be working, it may also redundantly send the hashname packets on any other established path.

<a name="paths" />
### Network Paths

The information about an available network transport is called a `path` and defined by a JSON object that contains a `"type":"..."` to identify which type of network it describes. The current path types defined are:

* `udp4` / `udp6` - UDP, contains `ip` and `port`, may be multiples (public and private ip's)
* `tcp4` / `tcp6` - TCP, contains `ip` and `port` like UDP
* `http` - contains `url` which can be http or https, see [HTTP](e3x/tp/http.md) for details
* `webrtc` - see [WebRTC](e3x/tp/webrtc.md), ideal for browsers that have only HTTP support
* `peer` - contains `hn`, this hashname will act as a router

These paths are used often within the protocol to exchange network information, and frequently sent as an array, for example:

```js
[{
  "type": "udp4",
  "ip": "127.0.0.1",
  "port": 42424
}, {
  "type": "tcp6",
  "ip": "fe80::2a37:37ff:fe02:3c22",
  "port": 42424
}, {
  "type": "http",
  "http": "http://127.0.0.1"
}]
```

