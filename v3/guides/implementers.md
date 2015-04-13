Implementers Guide
==================

> Work-In-Progress

Most active implementations are in the [telehash org](https://github.com/telehash/) github and listed [here](../#implementations).

Anyone implementing or interested in contributing should join the [telehash slack](http://6.telehash.org:3000).

<a name="base32" />
## Base 32

Implementations:

* [javascript](https://github.com/telehash/hashname/blob/master/index.js#L16) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/base32.c)
* [c#](https://github.com/telehash/telehash.net/blob/master/Telehash.Net/Base32.cs)
* [go](https://github.com/telehash/gogotelehash/tree/master/internal/util/base32util)

Test Fixtures (hex <=> base32):

```json
{
    "": "",
    "66": "my",
    "666f": "mzxq",
    "666f6f": "mzxw6",
    "666f6f62": "mzxw6yq",
    "666f6f6261": "mzxw6ytb",
    "666f6f626172": "mzxw6ytboi",
    "666f6f62617262": "mzxw6ytbojra",
    "666f6f6261726261": "mzxw6ytbojrgc",
    "666f6f626172626178": "mzxw6ytbojrgc6a",
    "9f": "t4",
    "9fa9": "t6uq",
    "9fa9e0": "t6u6a",
    "9fa9e037": "t6u6any",
    "9fa9e03792": "t6u6an4s",
    "9fa9e0379247": "t6u6an4si4",
    "9fa9e0379247ca": "t6u6an4si7fa",
    "9fa9e0379247cad2": "t6u6an4si7fne",
    "9fa9e0379247cad2d3": "t6u6an4si7fnfuy",
    "9fa9e0379247cad2d395": "t6u6an4si7fnfu4v",
    "9fa9e0379247cad2d395ad": "t6u6an4si7fnfu4vvu",
    "9fa9e0379247cad2d395ad7e": "t6u6an4si7fnfu4vvv7a",
    "9fa9e0379247cad2d395ad7e61": "t6u6an4si7fnfu4vvv7gc",
    "9fa9e0379247cad2d395ad7e61c2": "t6u6an4si7fnfu4vvv7gdqq",
    "9fa9e0379247cad2d395ad7e61c215": "t6u6an4si7fnfu4vvv7gdqqv",
    "9fa9e0379247cad2d395ad7e61c215ad": "t6u6an4si7fnfu4vvv7gdqqvvu",
    "9fa9e0379247cad2d395ad7e61c215ad32": "t6u6an4si7fnfu4vvv7gdqqvvuza",
    "9fa9e0379247cad2d395ad7e61c215ad32f7": "t6u6an4si7fnfu4vvv7gdqqvvuzpo",
    "9fa9e0379247cad2d395ad7e61c215ad32f768": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2a",
    "9fa9e0379247cad2d395ad7e61c215ad32f76838": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2by",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382c": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byfq",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd4": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftka",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44c": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkey",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf0": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4a",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l4",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5a": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5na",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae7": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5noo",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae780": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaa",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae78088": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaei",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae780884a": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaeiji",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae780884a98": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaeijkma"
}

```


<a name="hashname" />
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

## Implementations

* [javascript](https://github.com/telehash/hashname) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/hashname.c)
* [c#](https://github.com/telehash/telehash.net/blob/master/Telehash.Net/Hashname.cs)
* [go](https://github.com/telehash/gogotelehash/tree/master/hashname)

## Packets (LOB encoding)

* [javascript](https://github.com/quartzjer/lob-enc) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/lob.h)

It is common to also support [cloaking](../e3x/cloaking.md) within a LOB library as a convenience.

For easier debugging and testing, libraries should also support [base 32](../base32.md) encoding and decoding for easy visual identification/separation and to allow simple cutting/pasting of packets.

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

## Higher-level API

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

Set this link to be a default (trusted) [router](routing.md), which will automatically ask it to assist in connections to any other link and provide assistance in connecting to the local endpoint.

### `mesh.discover(bool)`

Set the local endpoint discovery mode to on or off, when on this will tell any available transport to announce the endpoint's presence on local networks and newly discovered endpoints will generate `onDiscover` events.

### Built-in and Custom Channels

All implementations should strive to support as many [channels](channels/) as possible directly using the language and patterns described in each channel definition.  For example, the [stream](channels/stream.md) channel should be supported with a simple `mesh.onStream` event to handle incoming requests and `link.stream()` to connect new streams (using a language-native streaming interface if possible).

Custom channels should be avoided whenever possible by using one of the built-in channels, and the API to create and handle custom channels is implementation specific.

## E3X

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

## E3X API 

The interface to use E3X is designed to minimize any accidential leakage of information by having a small explicit API.

Implementations may vary depending on their platform/language but should strive for a similar common pattern of interaction and method/data language as documented here at a high level.

All implementations will require a strong/secure random number generator to properly support all aspects of this API and the underlying ciphers/algorithms.

### `generate`

Create a new set of public and private keys for all supported Cipher Sets.

### `self(keypairs)`

Load a given set of public/secret keys to create a local endpoint state.

* `decrypt(message)` - take an enecrypted message received from a wire transport, return a decrypted [packet](../lob.md)

### `exchange(self, public keys)`

Load a given set of another endpoint's public keys to create an exchange state object between the `self` and that endpoint.

* `token` - 16 byte ephemeral exchange identifier
* `verify(message)` - validate that this message was sent from this exchange
* `encrypt(packet)` - return encrypted message to this endpoint
* `handshake(at)` - return a handshake with the given at value
* `sync(handshake)` - process incoming handshake, returns current at value
* `receive(channel)` - process/validate an incoming encrypted channel packet, return decrypted packet

### `channel(exchange, open)`

Requires an exchange that has sent/received a handshake and is in sync.

* `id` - unique numeric id
* `state` - current state of the channel (`ENDED`, `OPENING`, `OPEN`)
* `timeout` - get/set the current timeout value of this channel
* `send(packet)` - return encrypted channel packet

## Transports / Pipes

A `pipe` is an active delivery state as managed by a transport, that can be used by one or more transports to send packets to, and as the source of all packets.  A pipe can only signal back to the exchanges using it that a keepalive needs to be sent and when it is closed/invalid.  A transport only knows pipes and does not know about the exchanges or links on the other side, one pipe may be used by multiple exchanges (such as when routing).

## Chunking Implementations

* [js](https://github.com/telehash/lob-enc/blob/master/index.js#L101)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/chunks.h)

<a name="cs3a" />
## CS3a Example Code (handshake)

The following example illustrates the usage of cs3a for the sending and receiving handshakes for a new exchange.  

> Warning: pseudo code interspersed with real code.

Message (handshake) Encryption:
```js
// Generate Exchange Key Pair
var ephemeral = sodium.crypto_box_keypair();

// get the shared secret to create the iv+key for the open aes
var secret = sodium.crypto_box_beforenm(remote.publicKey, self.ephemeral.secretKey);
var nonce = crypto.randomBytes(24);

// encrypt the inner
var innerc = sodium.crypto_secretbox(inner, nonce, secret);
var body = Buffer.concat([ephemeral.publicKey,nonce,innerc]);

// hmac it with secret from the endpoint keys
var msecret = sodium.crypto_box_beforenm(remote.publicKey, self.secretKey);
var akey = crypto.createHash('sha256').update(Buffer.concat([nonce,msecret])).digest();
var mac = sodium.crypto_onetimeauth(body,akey);
```

Message Decryption:
```js
var key = body.slice(0,32);
var nonce = body.slice(32,32+24);
var innerc = body.slice(32+24,body.length-16);

var secret = sodium.crypto_box_beforenm(key, self.secretKey);

// decipher the inner
var inner = sodium.crypto_secretbox_open(innerc,nonce,secret);
```

Sender Verification:
```
var mac1 = body.slice(body.length-16);
var nonce = body.slice(32,32+24);

var secret = sodium.crypto_box_beforenm(remote.publicKey, self.secretKey);
var akey = crypto.createHash('sha256').update(Buffer.concat([nonce,secret])).digest();
var mac2 = sodium.crypto_onetimeauth(body.slice(0,body.length-16),akey);

if(mac2 != mac1) return false;
```

Channel Key Setup:
```js
// extract received ephemeral key
var key = body.slice(0,32);

var secret = sodium.crypto_box_beforenm(key, remote.ephemeral.secretKey);
var encKey = crypto.createHash("sha256")
      .update(secret)
      .update(remote.ephemeral.publicKey)
      .update(key)
      .digest();
var decKey = crypto.createHash("sha256")
      .update(secret)
      .update(key)
      .update(remote.ephemeral.publicKey)
      .digest();
```

Channel Encryption:
```js
var nonce = crypto.randomBytes(24);
var cbody = sodium.crypto_secretbox(inner, nonce, encKey);
var outer = Buffer.concat([nonce,cbody]);
```

Channel Decryption:
```js
var nonce = outer.slice(0,24);
var cbody = outer.slice(24);
var body = sodium.crypto_secretbox_open(cbody,nonce,decKey);
```

# JSON-RPC

A simple [JSON-RPC](http://www.jsonrpc.org) interface where the `Server` is the local endpoint and the `Client` is the app using it.  Any `{LINK}` refers to a standard [link JSON](../link.md#json) object.

```json
--> data sent to Server
<-- data sent to Client

--> {"jsonrpc": "2.0", "method": "meshGenerate", "params": [], "id": 1}
<-- {"jsonrpc": "2.0", "result": {LINK}, "id": 1}

--> {"jsonrpc": "2.0", "method": "meshLoad", "params": [{SECRETS}], "id": 1}
<-- {"jsonrpc": "2.0", "result": {LINK}, "id": 1}

--> {"jsonrpc": "2.0", "method": "meshLink", "params": ["mesh-hn", {LINK}], "id": 1}
<-- {"jsonrpc": "2.0", "result": {LINK}, "id": 1}

--> {"jsonrpc": "2.0", "method": "meshWait", "params": ["mesh-hn"], "id": 1}
<-- {"jsonrpc": "2.0", "result": {"event":"link","link":{LINK}}, "id": 1}

--> {"jsonrpc": "2.0", "method": "meshWait", "params": ["mesh-hn"], "id": 1}
<-- {"jsonrpc": "2.0", "result": {"event":"up","link":{LINK}}, "id": 1}

--> {"jsonrpc": "2.0", "method": "meshWait", "params": ["mesh-hn"], "id": 1}
<-- {"jsonrpc": "2.0", "result": {"event":"down","link":{LINK}}, "id": 1}

--> {"jsonrpc": "2.0", "method": "meshWait", "params": ["mesh-hn"], "id": 1}
<-- {"jsonrpc": "2.0", "result": {"event":"chan","link":{LINK},"chan":"base64"}, "id": 1}

--> {"jsonrpc": "2.0", "method": "linkChan", "params": ["mesh-hn","link-hn","c":1], "id": 1}
<-- {"jsonrpc": "2.0", "result": {"chan":"base64"}, "id": 1}

--> {"jsonrpc": "2.0", "method": "linkSend", "params": ["mesh-hn","link-hn","send":"base64"], "id": 1}
<-- {"jsonrpc": "2.0", "result": {}, "id": 1}

--> {"jsonrpc": "2.0", "method": "linkRecv", "params": ["mesh-hn","link-hn","c":1], "id": 1}
<-- {"jsonrpc": "2.0", "result": {"chan":"base64"}, "id": 1}

```
