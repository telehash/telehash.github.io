E3X - End-to-End Encrypted eXchange
===================================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

## Raw Brainstorming Notes

Defines:

* packet encoding format
* async encryption
* sync encryption
  * handshakes
  * keepalives
  * channel state
  * reliable channels
  * timeouts
* cipher-sets
* transport serializations

Designed to expose all trust decisions to app layer, zero metadata is ever written to a network, and no identity is revealed to any endpoint without explicit verified trust from the app.

E3X API:

````
e3x.init(keys);
// e3x.eid is us

// can be used anytime
packet = e3x.decode(buffer);
buffer = e3x.encode(packet);
// packet.header, packet.body, packet.js

// generic async crypto with any endpoint
eid = e3x.endpoint(parts, key); // cached until e3x.drop(eid)
packet = e3x.decrypt(eid, buffer);
buffer = e3x.encrypt(eid, packet);

// sync comms with any endpoint, for transport binding
packet = e3x.process(buffer); // validate any data from any network
// packet.eid is sender, must trust it before passing to receive
valid = e3x.receive(packet);
// valid is bool if packet is current, track the sending transport for this eid
buffer = e3x.keepalive(eid); // when the network transport needs to be re-validated, generates a handshake if any channels, will re-send and start to timeout channels if not confirmed
eid = e3x.busy();
// eid is the next endpoint that has data waiting to be sent or received
while(buffer = e3x.sending(eid)){ send to any/all active transports for this eid }
while(packet = e3x.receiving(eid)){ packet.cid is channel, process packets, cid is invalid after any err }
cid = e3x.channel(eid,kind,timeout) // reliable or unreliable, creates channel, timeout is for start/acks/ends
packet = e3x.packet(eid,cid) // packets created must be given to e3x.send() in order, packet.quota for space avail
queued = e3x.send(packet) // encrypts and shows up in .sending(), cid is invalid after sending any end/err, errors if not delivered, queues too, reliable packets are returned in .receiving() once delivered
// queued is number of packets waiting to be sent and/or ack'd
// channel invald after sending and receiving an end, half-ends will get timeout error

````

telehash "binding" provides native transport (sockets/events) and language (callbacks/objects) wrapper for all sending/processing

* Define a common serialization and mapping for every different transport type
* A "pipe" is a single active transport session (an ip:port, a connected websocket, etc)
* Each transport is responsible for all of its pipes
* Binding adds listener to pipe as needed
* Pipe independently events close and keepalive notifications to binding
* Binder takes path hints from app to bootstrap
* All handshakes turn paths into pipes of none or newer path
* Transport gives it's local/identifying paths
* Binder tracks active pipe, returns the active path per eid



Handshake (Open) Wire Changes:

* handshake is keepalive, 3x handshake times out
* handshake contains IV now so same key+line means same session, new at is just validation
* handshakes received are always returned w/ same at
* new ones generated are sent w/ at w/ last bit matching our cid mask to guarantee unique
* same session must have increasing at's


### older stuff

// endpoint has {e3x:{}, eids:{pipe:pid,active:{pid:path},inactive:[paths],parts,key}}
ep = new endpoint(e3x, piper)
 - piper(eid, path) returns a pid w/ eid added
ep.send()
 - e3x.sending() processing
eid = ep.add(parts, key)
 - trusts to handshake
ep.path(eid, path)
 - adds to inactive list
 - can be local broadcast
ep.receive(packet,pipe)
 - called by each network
 - if handshake, decrypt and validate
   - if already .add()'d, pass through to receive
   - if discovered set, fire callback to decide
 - if session, call e3x.session to get eid
 - receiving(eid,packet,flags)
   - if unreliable pipe, add keepalive time flag
   - if returns active, pipe.up(eid), set as default pipe, else pipe.send(null)
ep.down(eid,pid)
 - called by network for every eid a pipe was active for when it dies
 - removes pipe from eid
 - if pipe was default, run e3x.keepalive(eid,0);
 - if active[pid], move path to inactive
ep.discovered(callback)
 - calls callback(eid, parts, key, pipe)
 - for any unknown eid handshakes
 - doesn't reveal our eid
 - optional, for dynamic trust
 - calls ep.add() and ep.pipe() to accept
ep.discoverable(type)
 - enables responding to ping request
 - reveals eid to anyone asking
ep.local(type, callback)
 - calls back for any eid active locally
 - doesn't reveal our eid w/o going through .discovered first



// pipes has {e3x:{}, keys:{}, eids:{pipes:[]}}
p = new pipes(e3x, callback)
 - calls callback(eid) when we need pipes added
p.send()
 - e3x.sending() processing
p.add(eid, pipe)
 - adds to list of pipes per eid if new
 - sends current e3x.handshake(eid) or discovery request if no handshake
 - can be local broadcast
p.receive(buffer,pipe)
 - called by each network
 - decode buffer into packet
 - if discovery request and isDiscoverable(), send pong
 - if handshake, decrypt and validate
   - if already added, pass through to receive
   - if discovered set, fire callback to decide
 - if session, call e3x.session to get eid
 - receiving(eid,packet,flags)
   - if unreliable pipe, add keepalive time flag
   - if returns active, pipe.up(eid), set as default pipe, else pipe.drop()
ep.remove(eid,pipe)
 - called by network for every eid a pipe was active for when it dies
 - removes pipe from eid
 - if pipe was default, run e3x.keepalive(eid,0);
ep.pipes(callback)
 - calls callback(eid) whenever we need more pipes for this eid
ep.discovered(callback)
 - calls callback(eid, parts, key, pipe)
 - for any unknown eid handshakes
 - doesn't reveal our eid
 - optional, for dynamic trust
 - calls ep.add() and ep.pipe() to accept
ep.discoverable(type)
 - enables responding to ping request
 - reveals eid to anyone asking
ep.local(type, callback)
 - calls back for any eid active locally
 - doesn't reveal our eid w/o going through .discovered first
 



Diagrams:

```
Core Interface:
                  [ transports ] --->
                   -----------
[ channels | crypt | binding ]
------------------------------
[             E3X            ]
------------------------------


```

