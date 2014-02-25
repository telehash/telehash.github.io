# Packet Format

A packet has two distinct parts, a HEAD and a BODY, both optional. The HEAD is typically parsed as JSON and the BODY is always binary. Packets are generally synonymous with a UDP message so the total size of a packet is determined by the network transport and not part of the format. For encoding packets on other network transports see [HTTP](ext/path_http.md), [WebRTC](ext/path_webrtc.md), and [TCP](ext/path_tcp.md).

Every packet must begin with two bytes which form a network byte-order short unsigned integer. This integer represents the length in bytes of the 'HEAD' that follows it, and the remaining bytes in the packet are treated as raw binary and referenced as the 'BODY'.

The format is thus:

    <length>[HEAD][BODY]

A simplified example of how to decode a packet, written in Node.js:

```js
dgram.createSocket("udp4", function(msg){
    var head_length = msg.readUInt16BE(0);
    var head = msg.slice(2, head_length + 2);
    var body_length = msg.length - (head_length + 2);
    var body = msg.slice(head_length + 2, body_length);
    var json = (head_length >= 2) ? JSON.parse(head.toString("utf8")) : undefined;
});
```

When the HEAD length is two or greater, a parser must attempt to decode it as a UTF-8 JSON object or array.  When it is zero the packet contains only a BODY.

It is only a parsing error when the HEAD length is greater than the size of the packet or when the JSON decoding fails.  When successful, parsers must always return five values:

* `HEAD LENGTH` - 0 to packet length - 2
* `HEAD` - undefined/null or binary
* `JSON` - undefined/null or decoded object or array
* `BODY LENGTH` - 0 to packet length - (2 + HEAD LENGTH)
* `BODY` - undefined/null or binary


## HEAD

A length of 0 means there is no HEAD included and the packet is all binary (only BODY).

A length of 1 means there is a single byte value that is not JSON.

A length of 2+ means the HEAD must be a UTF-8 encoded JSON object or array (not any bare string/bool/number value).  If the JSON parsing fails, the parser must return an error.

## BODY

The optional BODY is always a raw binary of the remainder bytes between the packet's total length and that of the HEAD. 

Often packets are attached inside other packets as the BODY, enabling simple packet wrapping/relaying usage patterns.

The BODY is also used as the raw content transport for channels and any app-specific usage.

## Max Size

In most cases a switch will handle any data fragmentation/composition so that an application doesn't need to be aware of the actual packet/payload sizes in use.

Packet size is always determined by the MTU of the network path between any two instances, and in general any sent over the Internet using UDP can safely be up to 1472 bytes max size (1500 ethernet MTU minus UDP overhead).  

There are plans to add MTU size detection capabilities, but they are not standardized yet.
