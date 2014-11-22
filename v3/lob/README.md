# Length-Object-Binary Encoding (Packet Format)

This is a simple encoding scheme to combine any JSON object with any binary data (both are optional) into one byte array, often referred to as a single `packet`.  This encoding does not include any total packet size or checksums, and expects the context where it's used to provide those when necessary (see [chunking](chunking.md)).

## Implementations

* [javascript](https://github.com/quartzjer/lob-enc) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/lob.h)

It is common to also support [cloaking](e3x/cloaking.md) within a LOB library as a convenience.

## Definition

The wire-format byte array (a packet) is created by combining three distinct parts, the `LENGTH`, an optional `HEAD`, and an optional `BODY`.

The `LENGTH` is always two bytes which are a network-order short unsigned integer that represents the number of bytes for the `HEAD`.  When the `HEAD` is greather than 6 bytes then they are always parsed and represented as a UTF-8 JSON object.  Any bytes remaining after the `HEAD` are the `BODY` and always handled as binary.

The format is thus:

    <LENGTH>[HEAD][BODY]

A simplified example of how to decode a packet, written in Node.js:

```js
dgram.createSocket("udp4", function(msg){
    var head_length = msg.readUInt16BE(0);
    var head = msg.slice(2, head_length + 2);
    var body_length = msg.length - (head_length + 2);
    var body = msg.slice(head_length + 2, body_length);
    var json = (head_length >= 7) ? JSON.parse(head.toString("utf8")) : undefined;
});
```

It is only a parsing error when the `LENGTH` is greater than the size of the packet or when the JSON parsing fails.  When successful, parsers must always return five values:

* `HEAD LENGTH` - 0 to packet length - 2
* `HEAD` - undefined/null or binary
* `JSON` - undefined/null or decoded object
* `BODY LENGTH` - 0 to packet length - (2 + HEAD LENGTH)
* `BODY` - undefined/null or binary


## LENGTH / HEAD

A `LENGTH` of 0 means there is no `HEAD` included and the packet is all binary (only `BODY`).

A `LENGTH` of 1-6 means the `HEAD` is only binary (no JSON).

A `LENGTH` of 7+ means the HEAD must be a UTF-8 encoded JSON object (not any bare string/bool/number/array value) within the guidelines of [I-JSON](https://datatracker.ietf.org/doc/draft-ietf-json-i-json/?include_text=1).  If the JSON parsing fails, the parser must return an error.

## BODY

The optional `BODY` is always a raw binary of the remainder bytes between the packet's total length and that of the `HEAD`. 

Often packets are attached inside other packets as the `BODY`, enabling simple packet wrapping/relaying usage patterns.

