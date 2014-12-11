Implementers Guide
==================

> Work-In-Progress

## Hashname

```c
// these all create a new hashname
hashname_t hashname_str(char *str); // from a string
hashname_t hashname_keys(lob_t keys);
hashname_t hashname_key(lob_t key); // key is body, intermediates in json

// utilities related to hashnames
uint8_t hashname_valid(char *str); // validate a str is a hashname
uint8_t hashname_id(lob_t a, lob_t b); // best matching id (single byte)
lob_t hashname_im(lob_t keys, uint8_t id); // intermediate hashes in the json, optional id to set that as body
```

## Packets

```js
var lob = require('lob-enc');
var json = {
  "type":"test",
  "foo":["bar"]
};
var body = new Buffer("any binary!");
var bin = lob.encode(json, body));
// bin will be a buffer with json and body encoded

var packet = lob.decode(bin);
// packet.json == json, and packet.body == body

// do both encode and decode together, for convenience
var packet = lob.packet(json, body);

// object validator
var bool = lob.isPacket(packet);
```

## Mesh

```c
// must be called to initialize to a hashname from keys/secrets, return !0 if failed
uint8_t mesh_load(mesh_t mesh, lob_t secrets, lob_t keys);

// creates and loads a new random hashname, returns secrets if it needs to be saved/reused
lob_t mesh_generate(mesh_t mesh);

// return the best current URI to this endpoint, optional override protocol
char *mesh_uri(mesh_t mesh, char *protocol);

// creates a link from the json format of {"hashname":"...","keys":{},"paths":[]}, optional direct pipe too
link_t mesh_add(mesh_t mesh, lob_t json, pipe_t pipe);

// processes incoming packet, it will take ownership of packet
uint8_t mesh_receive(mesh_t mesh, lob_t packet, pipe_t pipe);

// callback when an unknown hashname is discovered
void mesh_on_discover(mesh_t mesh, char *id, link_t (*discover)(mesh_t mesh, lob_t discovered, pipe_t pipe));

// callback when a link changes state created/up/down
void mesh_on_link(mesh_t mesh, char *id, void (*link)(link_t link));

// callback when a new incoming channel is requested
void mesh_on_open(mesh_t mesh, char *id, lob_t (*open)(link_t link, lob_t open));
```

## Links

```c
// these all create or return existing one from the mesh
link_t link_get(mesh_t mesh, char *hashname);
link_t link_keys(mesh_t mesh, lob_t keys); // adds in the right key
link_t link_key(mesh_t mesh, lob_t key); // adds in from the body

// removes from mesh
void link_free(link_t link);

// load in the key to existing link
link_t link_load(link_t link, uint8_t csid, lob_t key);

// try to turn a path into a pipe and add it to the link
pipe_t link_path(link_t link, lob_t path);

// just add a pipe directly
link_t link_pipe(link_t link, pipe_t pipe);

// process an incoming handshake
link_t link_handshake(link_t link, lob_t inner, lob_t outer, pipe_t pipe);

// process a decrypted channel packet
link_t link_receive(link_t link, lob_t inner, pipe_t pipe);

// try to deliver this packet to the best pipe
link_t link_send(link_t link, lob_t inner);

// make sure current handshake is sent to all pipes
link_t link_sync(link_t link);

// trigger a new sync
link_t link_resync(link_t link);

// can channel data be sent/received
link_t link_ready(link_t link);

// create/track a new channel for this open
channel3_t link_channel(link_t link, lob_t open);

// set up internal handler for all incoming packets on this channel
link_t link_handle(link_t link, channel3_t c3, void (*handle)(link_t link, channel3_t c3, void *arg), void *arg);

// encrpt and send any outgoing packets for this channel, send the inner if given
link_t link_flush(link_t link, channel3_t c3, lob_t inner);
```

## e3x

### `self`

```c
// load id secrets/keys to create a new local endpoint
self3_t self3_new(lob_t secrets, lob_t keys);
void self3_free(self3_t self); // any exchanges must have been free'd first

// try to decrypt any message sent to us, returns the inner
lob_t self3_decrypt(self3_t self, lob_t message);
```

### `exchange`

```c
// make a new exchange
// packet must contain the raw key in the body
exchange3_t exchange3_new(self3_t self, uint8_t csid, lob_t key);
void exchange3_free(exchange3_t x);

// these are stateless async encryption and verification
lob_t exchange3_message(exchange3_t x, lob_t inner);
uint8_t exchange3_verify(exchange3_t x, lob_t outer);

// return the current incoming at value, optional arg to update it
uint32_t exchange3_in(exchange3_t x, uint32_t at);

// will return the current outgoing at value, optional arg to update it
uint32_t exchange3_out(exchange3_t x, uint32_t at);

// synchronize to incoming ephemeral key and set out at = in at, returns x if success, NULL if not
exchange3_t exchange3_sync(exchange3_t x, lob_t outer);

// generates handshake w/ current exchange3_out value and ephemeral key
lob_t exchange3_handshake(exchange3_t x);

// simple synchronous encrypt/decrypt conversion of any packet for channels
lob_t exchange3_receive(exchange3_t x, lob_t outer); // goes to channel, validates cid
lob_t exchange3_send(exchange3_t x, lob_t inner); // comes from channel 

// validate the next incoming channel id from the packet, or return the next avail outgoing channel id
uint32_t exchange3_cid(exchange3_t x, lob_t incoming);

// get the 16-byte token value to this exchange
uint8_t *exchange3_token(exchange3_t x);
```

### `channel`

```c
channel3_t channel3_new(lob_t open); // open must be channel3_receive or channel3_send next yet
void channel3_free(channel3_t c);

// sets new timeout, or returns current time left if 0
uint32_t channel3_timeout(channel3_t c, event3_t ev, uint32_t timeout);

// sets the max size (in bytes) of all buffered data in or out, returns current usage, can pass 0 just to check
uint32_t channel3_size(channel3_t c, uint32_t max); // will actively signal incoming window size depending on capacity left

// incoming packets
uint8_t channel3_receive(channel3_t c, lob_t inner); // usually sets/updates event timer, ret if accepted/valid into receiving queue
void channel3_sync(channel3_t c, uint8_t sync); // false to force start timers (any new handshake), true to cancel and resend last packet (after any exchange3_sync)
lob_t channel3_receiving(channel3_t c); // get next avail packet in order, null if nothing

// outgoing packets
lob_t channel3_oob(channel3_t c); // id/ack/miss only headers base packet
lob_t channel3_packet(channel3_t c);  // creates a sequenced packet w/ all necessary headers, just a convenience
uint8_t channel3_send(channel3_t c, lob_t inner); // adds to sending queue
lob_t channel3_sending(channel3_t c); // must be called after every send or receive, pass pkt to exchange3_encrypt before sending

// convenience functions
char *channel3_uid(channel3_t c); // process-unique string id
uint32_t channel3_id(channel3_t c); // numeric of the open->c id
char *channel3_c(channel3_t c); // string of the c id
lob_t channel3_open(channel3_t c); // returns the open packet (always cached)

enum channel3_states { ENDED, OPENING, OPEN };
enum channel3_states channel3_state(channel3_t c);
```

## Transports / Pipes

A `pipe` is an active delivery state as managed by a transport, that can be used by one or more transports to send packets to, and as the source of all packets.  A pipe can only signal back to the exchanges using it that a keepalive needs to be sent and when it is closed/invalid.  A transport only knows pipes and does not know about the exchanges or links on the other side, one pipe may be used by multiple exchanges (such as when routing).


