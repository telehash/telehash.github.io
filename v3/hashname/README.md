# Hashnames

A `hashname` is a unique fingerprint to represent one or more public keys of different formats, so that addressing and identity can be consistent across multiple PKI systems. This enables a compatibility layer for updating PKI in any application so that it can still represent and verify itself to both existing and new instances.

The `hashname` is always a [base 32](http://tools.ietf.org/html/rfc4648) encoded string that is 52 characters long with [no padding](http://tools.ietf.org/html/rfc4648#section-3.2), and when decoded is a 32 byte binary value result of a [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hash.  An example hashname is `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g`.

## Implementations

* [javascript](https://github.com/quartzjer/hashname) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/v3/src/hn.h) (in progress)

## Hashname Generation

### Key IDs

A hashname is created through multiple rounds of [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hashing of one or more public keys. Each public key included must have a unique single-byte `ID` with a byte array `VALUE` that is the consistent representation of that public key.

The `ID` and serialization format must be well defined and agreed upon by any platforms using hashnames, two such systems are:

* [Cipher Set](../e3x/cs/) definitions in [e3x](../e3x/)
* [JSON Web Key](JWK.md) mappings from [JOSE](https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-31#section-7.4)

### Intermediate Hashing

The binary byte array `VALUE` of each public key must first be hashed, resulting in a 32 byte `INTERMEDIATE` hash that is used in the rollup calculation.  These intermediate hashes may be used and exchanged instead of the full keys when only one key is in use.

### Final Rollup

To calculate the hashname the `INTERMEDIATE` hashes are sequentially hashed in ascending order by their `ID`. Each `ID` contributes two values: the single byte `ID` value and the 32 byte `INTERMEDIATE` hash value. The calculated hash is rolled up, wherein each resulting 32 byte binary digest is combined with the next binary value as the input. An example calculation would look like (in pseudo-code):

```js
hash = sha256(0x1a)
hash = sha256(hash + base32decode("gmamb66xcujtuzu9cm3ea9jjwxeyn2c0r8a4bz8y7b7n408bz630"))
hash = sha256(hash + 0x2a)
hash = sha256(hash + base32decode("5vt3teqvjettaxkzkh47a7ta48e3hgp3bruern92xgh89am04h4g"))
print base32encode(hash)
"vtneykw49cj8qw7ndvmejc8jw9zake8fkkmzvc8rautmf3evar90"
```

Here is a working example in node.js to do the calculation, results in `5ccn9gcxnj9nd7hp1m3v5pjwcu5hq80bt366bzh1ebhf9zqaxu2g`

```js
var crypto = require("crypto");
var base32 = require("base32");
var keys = {
  "3a":"tydfjkhd5vzt006t4nz5g5ztxmukk35whtr661ty3r8x80y46rv0",
  "1a": "8jze4merv08q6med3u21y460fjdcphkyuc858538mh48zu8az39t1vxdg9tadzun"
};
var rollup = new Buffer(0);
Object.keys(keys).sort().forEach(function(id){
  rollup = crypto.createHash("sha256").update(Buffer.concat([rollup,new Buffer(id,"hex")])).digest();
  var intermediate = crypto.createHash("sha256").update(new Buffer(base32.decode(keys[id]),"binary")).digest();
  rollup = crypto.createHash("sha256").update(Buffer.concat([rollup,intermediate])).digest();
});
var hashname = base32.encode(rollup);
```


