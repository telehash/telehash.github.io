Telehash
========

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

## Raw Brainstorming Notes

Telehash is a project to create interoperable encrypted networking libraries:

* 100% end-to-end encrypted at all times
* easy to use for developers to encourage wider adoption of privacy
* manages active link state on all connections
* native implementations to each language/platform
* capable of using different transport protocols
* supports bridging and routing privately or via a DHT
* each endpoint has verifiable unique id
* provides native tunneling of TCP/UDP, HTTP, WebSockets, and more
* strict privacy, no content, identity, or metadata is ever revealed to 3rd parties
* designed for embedded device, mobile, and web usage


Using E3X as it's core, Telehash implements the following base channels:

* link: create a private connection between two endpoints (mutual)
* route: ask a router to provide peering for this endpoint, can return see
* peer: request connection to an endpoint from a router
* seek: request which routers to use for an id
* connect: incoming connection request relayed
* path: sync network transport info to try any direct/alternative paths

Additional channels are used to provide tunneling of higher level protocols.

Telehash provides a common API pattern across all implementations:

var net = new Network(keys); // starts handling incoming link, path, and connect channels
net.link(id, direct, up); // optional direct endpoint info if using routers, calls up(id, true||false) on state changes
net.router(id, direct); // direct is required, routers not allowed any connections
net.discoverable(true||false, interface); // broadcasts on interface, enables anyone to connect/see id on it

// enable being a router, if any other routers it will return them in see
net.route(true||false); // starts handling route, peer, and seek channels

// tcp/udp socket tunneling
net.listen(args);
var conn = net.connect(id, args);

// http
net.server(args);
net.request(args);

// websocket
var sock = net.ws(args);
sock.on* = callback;
sock.send(data);
net.wss(args); // server

// chat
var chat = net.chat(args);

// box, async messages

// internal hooks to extend

