E3X - End-to-End Encrypted eXchange
===================================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

## Raw Brainstorming Notes

Defines:

* packet encoding format
* encrypted messages
* encrypted sessions
  * handshakes
  * keepalives
  * channel state
  * reliable channels
  * timeouts
* cipher-sets

E3X API:

var packet = new Decode(buffer);
var buffer = new Encode(packet);

var self = new Local(keys, send); // calls send(buffer, net)
var packet = self.decrypt(buffer); // for messages
var packet = self.receive(buffer, net); // validates channel ids for sessions, pass null for any waiting regularly

var eid = new Remote(self, parts, key);
var buffer = eid.handshake();
var buffer = eid.encrypt(packet); // for messages
eid.deliver(send); // temporarily calls send(buffer) until any incoming net is active
var cid = eid.channel(args);  // returns new channel id
var packet = eid.packet(cid);
// packet.js, packet.body, etc
eid.send(packet); // goes to any/all active paths, triggers handshake and queues if not

// e3x just tracks all sessions:{ "0a1b..":{channels:{}},cs:{}} and endpoints:{ "48c2..":{sid:"",handshake:buffer} }
// endpoints+sessions timeout independently when inactive
e3x.init(keys)
eid = e3x.validate(parts, key, buffer) // buffer optional to check signature, creates/caches eid->key, 
buffer = e3x.handshake(eid, packet) // must have called e3x.validate first, flushes any queued packets if new sid, packet optional to create session from given incoming handshake, returns new handshake if needed or no packet
packet = e3x.decrypt(buffer)
buffer = e3x.encrypt(parts, key, packet)
// may have event driven interface, otherwise must be called frequently for any timer based sends
while([buffer,eid] = e3x.sending()){ send to any/all active pipes for eid }
//var sid = e3x.session(eid,buffer) 
var cid = e3x.channel(eid,kind) // reliable or unreliable, creates channel, timeout is for start/acks/ends
var packet = e3x.packet(eid,cid) // packets created must be given to e3x.send() in order, error after sending end
e3x.send(eid,packet) // encrypts and shows up in .sending(), cid is invalid after sending any err, errors if not delivered, queues too
valid = e3x.receive(buffer) // returns 1 if new packet for a session (any handshake, reliable, or channel start), 0 if valid, -1 error
// must be called after any .receive and regularly for timeout errors
while([eid,cid,packet] = e3x.receiving()){ process channel packets, cid is invalid after any err }
// channel invald after sending and receiving an end, half-ends will get timeout error

networking guidelines:

* decrypt and validate handshakes, if trusted, try getting sid, if fail call/send handshake again
* //with any valid .session() result check and see if any waiting channels
* //store list of all known paths for every sid, any valid .session() and .receive() marks originating path as "active" for 30s
* //all returned .sending() buffers are copied to every active path for the given sid
* all cids return from .receiving() will always get a .end or .err (timeout)
* //session is active if any paths
* //exposes eid.active

// pipe id is like type:uid string
// pipe api gives to transport to handle
pipe.up any time it's made default
ep.down moves it to inactive
try to activate any inactive for any handshake
transport must handle cleanup / gc (like a socket)
transport handles discovery ping/pongs and perms

pipe is just transport type + connection id
pipes must keep track of their own keepalive and signal endpoints to run one
e3x receiving returns -1 (drop), 0 (ok), 1 (active)
keepalive will timeout channels

handshake is keepalive, 3x handshake times out
handshake contains IV now so same key+line means same session, new at is just validation
handshakes received are always returned w/ same at
new ones generated are sent w/ at w/ last bit matching our cid mask to guarantee unique
same session must have increasing at's

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

buffer = e3x.handshake(eid); // returns current handshake
eid = e3x.session(buffer);
active = e3x.receive(eid, buffer, keepalive time); // returns if active, and sets next keepalive if flag, this pipe is default
// for handshakes too to accept them after validated, same pipe logic
e3x.keepalive(eid, at); 
// schedules next keepalive up to at ahead (if needed, anything received cancels)
// upon external pipe close for eid, fire keepalive()
while([eid,buffer] = e3x.sending()) // if no buffer then pipe.down(eid) cleanup
// if buffer is a handshake or empty, convert all paths to pipes and send to all
// session only to active pipe if any, else to all pipes
while([eid,packet] = e3x.receiving())

pipe.id // guid
pipe.send()
pipe.isLocal() // only true if active
pipe.isDiscoverable() // only when enabled per network
pipe.expireAt() for optional keepalive info, .down when expired
pipe.up(eid) / .down(eid) // refcount style


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
 

No handshake if no channels active
Transport responsible for all pipes
Binding adds listener to pipe as needed
Pipe events close and keepalive notifications
Binding connects transport and E3X
Binder takes path hints to bootstrap
All handshakes turn paths into pipes of none or newer path
Transport gives it's local/identifying paths
Binder tracks active pipe, returns the active path per eid

