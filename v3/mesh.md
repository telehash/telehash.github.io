Mesh Network
============

A mesh network consists of one or more links, which are active encrypted sessions between two endpoints over any transport.  Each endpoint is identified with a unique hashname, the fingerprint of it's public key(s).  A mesh is private to each endpoint, which has complete control over what links it accepts.

[Channels](channels/) are used to create a mesh and run common services over it:

  * peer: request connection to an endpoint from a router
  * connect: incoming connection request relayed
  * path: sync network transport info to try any direct/alternative paths
  * sock: tcp/udp socket tunneling 
  * stream: binary streams
  * thtp: mapping/proxying of http requests/responses
  * ws: websocket api
  * chat: personal messaging
  * box: async/offline messaging

These are combined into simple easy to use interoperable libraries with a common API (pseudocode):

```js
var mesh = telehash.mesh({keys}); // starts handling incoming link, path, and connect channels
mesh.router(direct); // direct is keys/paths
var link = mesh.link({hashname, keys, paths}, packetf(in,cb){}); // optional keys/paths endpoint info if using routers, optional packetf to gen/process passed in link request and to handle incoming, marked up w/ cb(), down w/ cb(err), and just sends packet w/ cb(undef,pkt);
link.up = function(true||false){}; // called on state changes
var link2 = link.link(hashname);  // use existing link to create one to another (they are routing)
link.route = true; // enable any other link to route to/from this one

// for dynamic links (servers), or to be available on and discover new on local transport
mesh.discover(callback); // callback(hashname) given before responding, use .link to accept

// tcp/udp socket tunneling
mesh.listen(args); // only links can connect
var conn = link.connect(args);

// http
mesh.server(args);
var req = link.request(args);

// websocket
var sock = link.ws(args);
sock.on* = callback;
sock.send(data);
mesh.wss(args); // server for any links

// chat
var chat = mesh.chat(args);
chat.add(link);

// box, async messages

// internal hooks to extend custom channels
```

## Discovery

By default a local endpoint will never respond to any request unless it comes from another endpoint it already knows and trusts.  A `discover` mode can be enabled that changes this behavior and broadcasts the endpoint's hashname and keys to any local [network transport](transports/) that supports discovery.

This mode should be used sparingly so that local networks cannot record what endpoints are available, typically only enabled based on a user behavior ("add a friend" or "pair device", etc) and only for a short period of time.  Permanent local services/servers that support dynamic association may have it always enabled.

All transports that support discovery will always be listening for incoming discover announcements regardless of the discovery state and pass those to the application to evaluate.  Discovery does not need to be enabled to receive announcements and see other endpoints, only to announce the local endpoint.

## Mesh Structure

* a mesh is a local hashname and links to one or more other hashnames (full mesh)
* they may have one or more routers, which only support "route" channels (was "peer") and do relaying/bridging
* routers must come with keys/paths
* individual hashnames may have their own router defined
* a router must have a way to validate hashnames before routing to them
* any hashname may advertise it's router as a path (and must provide routing to it for the first handshake)