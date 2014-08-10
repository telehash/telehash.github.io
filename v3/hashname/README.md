## Hashnames

A Telehash address is called a `hashname` and is always either a 64 length lower case hex string or 32byte binary value result of a [SHA-256](http://en.wikipedia.org/wiki/SHA-2).  An example hashname is `2dbf1ce81180d9ed9258e3e8729ba642c8ab2a31268d31cd2c7ffe8693e3a02e`.

Hashnames are always generated locally by an application instance from one or more cipher sets and are often used to create a [DHT](dht.md).  A hashname is not intended to be used by more than one running instance at the same time (see [faq](faq.md#simultaneous)), and the private keys for a cipher set should never leave local storage.

Applications should treat hashnames as an instance or reachable network address, not as a permanent or portable user identity.  Hashnames should always map to a single instance or device and may change due to a reinstall or storage reset.

## Hashname Calculation

A hashname is the [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hash of one or more [Cipher Set](cipher_sets.md) fingerprints.  The collection of fingerprints making up a hashname is called its `parts` and is required to calculate it.  A hashname may be created from just one Cipher Set or up to 8 different ones, each contributing its CSID and a fingerprint.

Here is an example JSON `parts` object composed of two Cipher Sets:

```json
{
  "2a": "bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe",
  "1a": "a5a741fa09b05baaead17fa9932e13cdafc7bcd39db1153fc6bbfe4614c063f3"
}
```

To calculate the hashname the parts are hashed in ascending order by their CSID, and each part contributes two values, the CSID and the fingerprint. The hash is rolled up, wherein each resulting binary digest is combined with the next string value as the input. For the above example parts, the calculation would look like (in pseudo-code):

```js
hash = sha256("1a")
hash = sha256(hash + "a5a741fa09b05baaead17fa9932e13cdafc7bcd39db1153fc6bbfe4614c063f3")
hash = sha256(hash + "2a")
hash = sha256(hash + "bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe")
print hex(hash)
"0b0137a6b38d00780686207b6f4b19e8731e68c6f76b435c85faf77100851451"
```

Here is a working example in node.js to do the calculation:

```js
var crypto = require("crypto");
var parts = {"2a":"bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe","1a":"a5a741fa09b05baaead17fa9932e13cdafc7bcd39db1153fc6bbfe4614c063f3"};
var rollup = new Buffer(0);
Object.keys(parts).sort().forEach(function(id){
  rollup = crypto.createHash("sha256").update(Buffer.concat([rollup,new Buffer(id)])).digest();
  rollup = crypto.createHash("sha256").update(Buffer.concat([rollup,new Buffer(parts[id])])).digest();
});
var hashname = rollup.toString("hex");
```
