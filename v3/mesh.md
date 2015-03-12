Mesh Network
============

A mesh network consists of one or more [links](link.md), which are active [encrypted sessions](e3x/) between two endpoints over any [transport](transports/).  Each endpoint is identified with a unique [hashname](hashname.md), the fingerprint of it's public key(s).  A mesh is private to each endpoint, which has complete control over what links it accepts, there is no automatic sharing of any link state to any other link.

Once a link is up, [channels](channels/) are used to run common services over it:

  * peer: request connection to an endpoint from a router
  * connect: incoming connection request relayed
  * path: sync network transport info to try any direct/alternative paths
  * sock: tcp/udp socket tunneling 
  * stream: binary streams
  * thtp: mapping/proxying of http requests/responses
  * chat: personal messaging
  * box: async/offline messaging

## Mesh Structure

* a mesh is a local hashname and links to one or more other hashnames (full mesh)
* any link may be flagged as a `router` when it will provide relaying/bridging to other links
* individual hashnames may have their own router defined
* a router must have a way to validate hashnames before providing routing assistance to them
* any hashname may advertise it's router as a path (and must provide routing to it for the first handshake)
* a hashname my use a base [URI](uri.md) from a router as an out-of-band mechanism to establish new links

## API

A simple API is documented here to help provide a consistent foundation for all implementations by using similar methods/names and interaction patterns:


### `mesh = create(keypairs)`

Create a new mesh using the given keypairs (or generate new ones).  This should enable all transports and start handling incoming channels.

### `mesh.onDiscover = function (from) {...}`

When a new unknown hashname is discovered at any point (from transports or a connect channel), all of the details (keys, hashname, paths) are given to a callback or discovery event to be processed by the app.

### `link = mesh.link(to)`

Establish a link to the given hashname.  The `to` may be a [URI](uri.md), [JSON link](link.md#json), or just a plain hashname.

### `link.onLink = function (state) {...}`

When the link state changes to up or down the app must be able to receive these events, as well as check the current state at any point.

### `link.router(bool)`

Set this link to be a default (trusted) router, which will automatically ask it to assist in connections to any other link and provide assistance in connecting to the local endpoint.

### `mesh.discover(bool)`

Set the local endpoint discovery mode to on or off, when on this will tell any available transport to announce the endpoint's presence on local networks and newly discovered endpoints will generate `onDiscover` events.

### Built-in and Custom Channels

All implementations should strive to support as many [channels](channels/) as possible directly off of `mesh` and `link` objects using the language and patterns described in each channel definition.  For example, the [stream](channels/stream.md) channel should be supported with a simple `mesh.onStream` event to handle incoming requests and `link.stream()` to connect new streams (using a language-native streaming interface if possible).

Custom channels should be avoided whenever possible by using one of the built-in channels, and the API to create and handle custom channels is implementation specific.

## Discovery

By default a local endpoint will never respond to any request unless it comes from another endpoint it already knows and trusts.  A `discover` mode can be enabled that changes this behavior and broadcasts the endpoint's hashname and keys to any local [network transport](transports/) that supports discovery.

This mode should be used sparingly so that local networks cannot record what endpoints are available, typically only enabled based on a user behavior ("add a friend" or "pair device", etc) and only for a short period of time.  Permanent local services/servers that support dynamic association may have it always enabled.

All transports that support discovery will always be listening for incoming discover announcements regardless of the discovery state and pass those to the application to evaluate.  Discovery does not need to be enabled to receive announcements and see other endpoints, only to announce the local endpoint.

