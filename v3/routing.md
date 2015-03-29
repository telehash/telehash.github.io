# Routing

A `router` in telehash is simply any endpoint that is willing to forward packets between two other endpoints, at least one of which it must already have a [link](link.md) for.  These packets are still encrypted such that the routing endpoint cannot decode the contents, but all usage of routing still requires a trusted relationship as the routers are at least aware of which two endpoints are connecting to each other.

When a `router` is forwarding the initial handshakes for endpoints first connecting, typically those endpoints will be able to negotiate and establish direction connections immediately and not rely on the router to forward future packets for that session.  When there is no working direct network path between the two endpoints the router should continue forwarding, but may rate-limit to reduce the impact on it's own network.

Any `router` role is an explicit choice by the application, either based on an administrative decision (specific default routers) or a trust relationship (offering to route for friends).  These may be through configuration values or automatically discovered by advertising support through a `peer` in the [path](channels/path.md) channel.

All routing is performed by using a [peer](channels/peer.md) channel to the router, and a [connect](channels/connect.md) channel from the router to the requested endpoint.  A `router` never responds to or reveals any known state about the target endpoint about the requesting endpoint.

The use of [URIs](uri.md) may be supported by routers to facilitate easier methods of connecting to new/third-party endpoints.

A [mesh](mesh.md) may have one or more default routers which are sent a peer request for every new link connection attempt.  Each link may have one or more routers that are signalled from the link itself through a peer path or other application-level relationships, and these routers are used for all future connection attempts for that link.
