# Packet Format

This is a simple encoding scheme to combine any JSON object with any binary data (both are optional) into one byte array, often referred to as a single `packet`.  This encoding does not include any total packet size or checksums, and expects the context where it's used to provide those when necessary (see [chunking](chunking.md)).

## Definition

The wire-format byte array (a packet) is created by combining three distinct parts, the `LENGTH`, an optional `HEAD`, and an optional `BODY`.

The `LENGTH` is always two bytes which are a network-order (Big-endian) short unsigned integer that represents the number of bytes for the `HEAD`.  When the `HEAD` is greather than 6 bytes then they are always parsed and represented as a UTF-8 JSON object.  Any bytes remaining after the `HEAD` are the `BODY` and always handled as binary.

The format is thus:

    <LENGTH>[HEAD][BODY]

A simplified example of how to decode a packet, written in Node.js:

```js
dgram.createSocket("udp4", function(msg){
  var head_len = msg.readUInt16BE(0);
  var head = msg.slice(2, head_len + 2);
  var body_len = msg.length - (head_len + 2);
  var body = msg.slice(head_len + 2, body_len);
  if (head_len >= 7) {
    var json = JSON.parse(head);
  }
});
```

It is only a parsing error when the `LENGTH` is greater than the size of the packet.  When successful, parsers must always return five values:

* `HEAD LENGTH` - 0 to packet length - 2
* `HEAD` - undefined/null or binary
* `JSON` - undefined/null or decoded object
* `BODY LENGTH` - 0 to packet length - (2 + HEAD LENGTH)
* `BODY` - undefined/null or binary


## LENGTH / HEAD

A `LENGTH` of 0 means there is no `HEAD` included and the packet is all binary (only `BODY`).

A `LENGTH` of 1-6 means the `HEAD` is only binary (no JSON).

A `LENGTH` of 7+ means the `HEAD` may be a UTF-8 encoded JSON object (not any bare string/bool/number/array value) within the guidelines of [I-JSON](https://datatracker.ietf.org/doc/draft-ietf-json-i-json/?include_text=1) beginning with a `{` and ending with a `}` character.

If the JSON object parsing fails, the parser must include an error but still return the decoded `HEAD`/`BODY` byte structures and lengths.

## BODY

The optional `BODY` is always a raw binary of the remainder bytes between the packet's total length and that of the `HEAD`. 

Often packets are attached inside other packets as the `BODY`, enabling simple packet wrapping/relaying usage patterns.

<a name="jose" />
## JSON Web Encryption / Signing (JWE/JWS)

LOB encoding can be used as an optimized serialization of the [JOSE](https://datatracker.ietf.org/wg/jose/charter/) based [JWE](https://tools.ietf.org/html/draft-ietf-jose-json-web-encryption-40)  and [JWS](https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-41) standards.

The LOB encoding is simply a consistent binary translation of the JWS/JWE compact serialization, there are no semantic changes to the contents in either direction.

<a name="jws" />
### JWS

Any [JWS](https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-41) can be mapped to two LOB packets (one attached to another):

* HEAD: {JWS Protected Header (JWT Header)}
* BODY: attached LOB
  * HEAD: {JWS Payload (JWT Claims)}
  * BODY: JWS Signature (binary)

The attached HEAD is treated as a binary octet string when translating, even though it is frequently JSON it must be preserved as the original bytes for signature validation and non-JSON use cases.

<a name="jwe" />
### JWE

Any [JWE](https://tools.ietf.org/html/draft-ietf-jose-json-web-encryption-40) can be mapped to three LOB packets (as attached descendents):

* HEAD: {JWE Protected Header}
* BODY: attached LOB
  * HEAD: {JWE JSON (Encrypted Key, IV, Tag, AAD)}
  * BODY: attached LOB
    * HEAD: {optional unprotected header}
    * BODY: JWE Ciphertext (binary)

Example:

```json
{"alg":"RSA-OAEP","enc":"A256GCM"}
BODY: {"aad":"","iv":"","tag":"","encrypted_key":""}
  BODY: (no header)
    BODY: ciphertext
```


