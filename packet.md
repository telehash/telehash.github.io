# Packet Format

A packet can include JSON or raw binary data, and typically has both with JSON acting as the dynamic header.  Packets are generally synonymous with a UDP message so the total size of a packet is determined by the network transport and not part of the format. For encoding packets on other network transports see [HTTP](ext/path_http.md), [WebRTC](ext/path_webrtc.md), and [TCP](ext/path_tcp.md).

Every packet must begin with two bytes which form a network byte-order short unsigned integer. This integer represents the length in bytes of the JSON header that follows it and the remaining bytes in the packet are treated as raw binary and referenced as the 'BODY'.

When the JSON length is two or greater it must contain a UTF-8 encoded object or array.  When it is zero the packet contains only a BODY, and when the length is one then it contains only a single unsigned byte that is mapped into a JSON object.

The format is thus:

    <length><JSON>[BODY]

A simplified example of how to decode a packet, written in Node.js:

``` js
dgram.createSocket("udp4", function(msg){
    var length = msg.readUInt16BE(0);
    if(length) var js = (length == 1) ? {"#":msg.readUint8(2)} : JSON.parse(msg.toString("utf8", 2, length + 2));
    var body = msg.slice(length + 2);
});
```

It is only a parsing error when the JSON length is greater than the size of the packet and when the JSON parsing fails.  When successful, parsers must always return four values:

* `JSON LENGTH` - 0 to packet length - 2
* `JSON` - undefined, object, or array
* `BODY LENGTH` - 0 to packet length - (2 + JSON LENGTH)
* `BODY` - undefined or binary


## JSON

A length of 0 means there is no JSON included and the packet is all binary (only BODY).

A length of 1 means there is a single byte value, which must be mapped into a JSON object with the key of "#" and the value an integer from 0 to 255.  For example, the byte "t" would be the object `{"#":116}`.

A length of 2+ means those bytes must be a UTF-8 encoded JSON object or array (not any bare string/bool/number value).  If the JSON parsing fails, the parser must return an error.

## BODY

The optional BODY is always a raw binary of the remainder bytes between the packet's total length and that of the JSON. 

Often packets are attached inside other packets as the BODY, enabling simple packet wrapping/relaying usage patterns.

The BODY is also used as the raw content transport for channels and any app-specific usage.

## Max Size

In most cases a switch will handle any data fragmentation/composition so that an application doesn't need to be aware of the actual packet/payload sizes in use.

Packet size is always determined by the MTU of the network path between any two instances, and in general any sent over the Internet using UDP can safely be up to 1472 bytes max size (1500 ethernet MTU minus UDP overhead).  

There are plans to add MTU size detection capabilities, but they are not standardized yet.
