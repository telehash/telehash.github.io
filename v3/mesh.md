Mesh Network
============

A mesh network consists of one or more [links](link.md), which are active [encrypted sessions](e3x/) between two endpoints over any [transport](transports/) established by exchanging [handshakes](e3x/handshake.md).  

Each link is identified with a unique [hashname](hashname.md).  A mesh is private to each endpoint, which has complete control over what links it accepts (there is no automatic sharing of any link state to any other endpoint).

Once handshakes are verified and a link is up, [channels](channels/) are used to send data over the link between endpoints.

Any link may be set as a [router](routing.md) when it is known that it will provide relaying/bridging to other links.  Any endpoint may advertise its [router](routing.md) as a path to other endpoints that may not have the same router.  An endpoint may also use a base [URI](uri.md) from a [router](routing.md) as an out-of-band mechanism to establish new links.

<a name="discovery" />
## Discovery

By default a local endpoint will never respond to any request unless it comes from a link it already knows and trusts.  Implementations should support a `discover` mode that can be enabled to temporarily change this behavior and broadcast the endpoint's hashname and keys to any local [network transport](transports/) that supports discovery.

This mode should be used sparingly so that local networks cannot record what endpoints are available. Typically this is enabled only based on a user behavior ("add a friend" or "pair device", etc) and only for a short period of time.  Permanent, local, well-known services/servers that support dynamic association may have it always enabled.

All transports that support discovery should always be listening for incoming `discover` announcements regardless of the discovery state and pass those to the application to evaluate.  Discovery does not need to be enabled to receive announcements and see other endpoints, only to announce the local endpoint.

