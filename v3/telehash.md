Telehash
========

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

## Raw Brainstorming Notes

Telehash is a project to create interoperable encrypted p2p mesh networking:

* 100% end-to-end encrypted at all times
* designed to compliment and add to existing transport security
* easy to use for developers to encourage wider adoption of privacy
* manages active link state on all connections
* native implementations to each language/platform
* capable of using different transport protocols
* supports bridging and routing privately or via a DHT
* each endpoint has verifiable unique fingerprint
* provides native tunneling of TCP/UDP, HTTP, WebSockets, and more
* strict privacy, no content, identity, or metadata is ever revealed to 3rd parties
* designed for embedded device, mobile, and web usage

Telehash defines several independent specifications:

* Packet - Minimal JSON+Binary Packet Encoding
  * Transports - Common Serialization of Packets
* Hashname - Compound Public-Key Fingerprinting
* [E3X](E3X.md) - End-to-End Encrypted eXchange
* Discovery - Announcing/Listening Mappings to Local Networks
* Channels - Common Multi-Purpose Channels
  * link: create a private connection between two endpoints (mutual)
  * route: ask a router to provide peering for this endpoint, can return see
  * peer: request connection to an endpoint from a router
  * seek: request which routers to use for an id
  * connect: incoming connection request relayed
  * path: sync network transport info to try any direct/alternative paths
  * socket: tcp/udp socket tunneling
  * stream: binary streams
  * http: mapping of http requests/responses
  * ws: websocket messaging api
  * chat: personal messaging
  * box: async/offline messaging

These are combined into simple easy to use interoperable libraries with a common API:

var mesh = new telehash.Mesh(keys); // starts handling incoming link, path, and connect channels
mesh.router(direct); // direct is keys/paths
var link = mesh.link(hashname, direct, up); // optional direct endpoint info if using routers, direct may be other keys/paths that is used as a router for this id
link.up = function(true||false){}; // called on state changes
var link2 = link.link(hashname);  // use existing link to create one to another (they are routing)
link.route = true; // enable any other link to route to/from this one

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

## Mesh Structure

* a mesh is a local hashname and links to one or more other hashnames (full mesh)
* they may have one or more routers, which only support "route" channels (was "peer") and do relaying/bridging
* routers must come with keys/paths
* individual hashnames may have their own router defined
* a router must have a way to validate hashnames before routing to them
* any hashname may advertise it's router as a path (and must provide routing to it for the first handshake)