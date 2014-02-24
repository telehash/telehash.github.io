## Packets

A packet uses JSON as a core extensible and widely supported data format, but also support raw binary data transfer for efficiency.

Every packet must begin with two bytes which form a network byte-order
short unsigned integer. This integer represents the length in bytes of
the UTF-8 encoded JSON object which follows it. The JSON portion of the
packet is optional, so the length may be from zero up to the length of the packet minus two (for the length bytes).

Any remaining bytes on the packet after the JSON are considered raw binary and
referenced as the 'BODY' when used in definitions below.

The format is thus:

    <length><JSON>[BODY]

A simplified example of how to decode a packet, written in Node.js:

``` js
dgram.createSocket("udp4", function(msg){
    var length = msg.readUInt16BE(0);
    var js = JSON.parse(msg.toString("utf8", 2, length + 2));
    var body = msg.slice(length + 2);
});
```

Packet size is determined by the MTU of the network path between any two instances, and in general any sent over the Internet using UDP can safely be up to 1472 bytes max size (1500 ethernet MTU minus UDP overhead).  There are plans to add MTU size detection capabilities, but they are not standardized yet.  In most cases a switch will handle any data fragmentation/composition so that an application doesn't need to be aware of the actual packet/payload sizes in use.

### JSON

The JSON section of a packet often acts as a header of a binary payload.
The fields used vary depending on the context and are specified below,
but all packets sent over the network contain a `type` field with a string value.

### BODY

The optional BODY is always a raw binary of the remainder bytes between
the packet's total length and that of the JSON as indicated by LENGTH
above. Often a BODY is another full raw packet and will be decoded
identically to being read from the network, this pattern of one
packet enclosing/attaching another is how the [Cipher Sets][] encrypt data.

The BODY is also used as the raw (optionally binary) content transport
for channels and for any app-specific usage.