# Hashnames

A `hashname` is a unique fingerprint to represent one or more public keys of different formats, so that addressing and identity can be consistent across multiple PKI systems. This enables a compatibility layer for updating PKI in any application so that it can still represent and verify itself to both existing and new instances.

The `hashname` is always a [base 32](http://tools.ietf.org/html/rfc4648) encoded string that is 52 characters long, lower cased with [no padding](http://tools.ietf.org/html/rfc4648#section-3.2).  When decoded it is alway a 32 byte binary value result of a [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hash.  An example hashname is `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g`.

In many ways, a `hashname` can be used as a portable secure [MAC address](http://en.wikipedia.org/wiki/MAC_address), it is a globally unique identifier for a network endpoint that is also self-generated and cryptographically verifiable.

## Implementations

* [javascript](https://github.com/telehash/hashname) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/hashname.c)
* [go](https://github.com/telehash/gogotelehash/tree/master/hashname)

## Hashname Generation

A hashname is calculated by combining the binary public key material of one or more different [cryptographic algorithms](http://en.wikipedia.org/wiki/Public-key_cryptography) through multiple rounds of [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hashing.  

The generation has three distinct steps:

1. Each active key is mapped to a unique one-byte `ID` based on its algorithm to provide consistent ordering
2. The binary key material for each `ID` is hashed into intermediate digest values
3. An ordered roll-up hashing of the intermediate values generates the final 32-byte digest

### Key IDs

Each public key included must have a unique single-byte `ID` with a byte array `VALUE` that is the consistent binary encoding of that public key material for a given algorithm. Only one key can be used per-algorithm to calculate a hashname.

The current public key `ID` mappings and `VALUE` binary encodings are defined in [Cipher Sets](../e3x/cs/).

Any hashname generation software does not need to know or understand the Cipher Sets or support the algorithms defined there, it only has to do the consistent hashing of any given set of `ID` and `VALUE` pair inputs.

### Intermediate Hashing

The binary byte array `VALUE` of each public key must first be hashed, resulting in a 32 byte intermediate digest that is used in the rollup calculation.  These intermediate digests may be used by applications and exchanged instead of the full keys when necessary.

### Final Rollup

To calculate the hashname the intermediate digests are sequentially hashed in ascending order by their `ID`. Each one contributes two values: the single byte `ID` value and the 32 byte intermediate digest value. The calculated hash is rolled up, wherein each resulting 32 byte binary output is concatenated with the next binary value as the input. An example calculation would look like (in pseudo-code):

```js
hash = sha256(0x1a)
hash = sha256(hash + 0x21b65ba5a9567fed892569f00090b3c17fd66a5c32d7b355940088605fa7f350)
hash = sha256(hash + 0x3a)
hash = sha256(hash + 0x97d83d1af8919874a449769145b7b3cb46359b2c12169ee53e683477bec47101)
final = hash
```

Here is a working example in node.js to do the calculation, results in `5ccn9gcxnj9nd7hp1m3v5pjwcu5hq80bt366bzh1ebhf9zqaxu2g`

```js
var crypto = require("crypto");
var base32 = require("rfc-3548-b32"); // https://github.com/sehrope/node-rfc-3548-b32
var keys = {
  "3a":"eg3fxjnjkz763cjfnhyabeftyf75m2s4gll3gvmuacegax5h6nia",
  "1a": "an7lbl5e6vk4ql6nblznjicn5rmf3lmzlm"
};
var rollup = new Buffer(0);
Object.keys(keys).sort().forEach(function(id){
  rollup = crypto.createHash("sha256").update(Buffer.concat([rollup,new Buffer(id,"hex")])).digest();
  var intermediate = crypto.createHash("sha256").update(new Buffer(base32.decode(keys[id]),"binary")).digest();
  rollup = crypto.createHash("sha256").update(Buffer.concat([rollup,intermediate])).digest();
});
var hashname = base32.encode(rollup).toLowerCase().split("=").join(""); // normalize to lower case and remove padding
```

## Mapping/Addressing

When exchanging hashnames over existing IPv4/IPv6 based systems, the 4 or 16 byte prefix of the 32 byte hashname binary value is used to provide a backward-compatible mechanism for addressing.  It does not guarantee uniqueness (which should be enforced outside of the IP-based systems) but for many use-cases it can be a helpful connectivity signalling tool.

When the IP space must be scoped into a reserved range and the port number is also available to use, the first 2 bytes may be sent as the port and then those 2 bytes in the address are hard-coded to a reserved IP prefix.

A hashname may also be used as a normal MAC address with the prefix of `42` (has the locally-assigned bit set) and the first 5 bytes of the hashname: `42:XX:XX:XX:XX:XX`.


