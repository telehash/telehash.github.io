# Hashnames

A `hashname` is a unique fingerprint to represent one or more public keys of different formats, so that addressing and identity can be consistent across multiple PKI systems. This enables a compatibility layer for updating PKI in any application so that it can still represent and verify itself to both existing and new instances.

The `hashname` is always a [base 32](http://tools.ietf.org/html/rfc4648) encoded string that is 52 characters long, and when decoded is a 32 byte binary value result of a [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hash.  An example hashname is `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g`.

## Implementations

* [javascript](https://github.com/quartzjer/hashname) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/v3/src/hn.h) (in progress)

## Hashname Generation

### Key IDs

A hashname is created through multiple rounds of [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hashing of one or more public keys. Each public key included must have a unique single-byte `ID` with a byte array value that is the consistent representation of that public key.  The `ID` and serialization format must be well defined and agreed upon by any platforms using hashnames, an example of which is the [Cipher Set](../e3x/cipher_sets.md) definitions in [e3x](../e3x/).

### Intermediate Hashing

The binary byte array of each public key must first be hashed, resulting in a 32 byte `intermediate hash` value that is used in the rollup calculation.  These intermediate values may be used and exchanged instead of the full keys when only one key is in use.

### Final Rollup

To calculate the hashname the intermediate values are sequentially hashed in ascending order by their `ID`. Each `ID` contributes two values: the single byte `ID` value and the 32 byte intermediate hash value. The hash is rolled up, wherein each resulting binary digest is combined with the next binary value as the input. An example calculation would look like (in pseudo-code):

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



## Exchanging Keys

<a name="json" />
### Full JSON

The source keys to calculate a hashname may be exchanged and represented as a complete JSON object where the ID is in HEX and the public key is BASE32 encoded:

```json
{
  "3a":"tydfjkhd5vzt006t4nz5g5ztxmukk35whtr661ty3r8x80y46rv0",
  "2a": "621028hg1m30jam6923fe381040ga003g80gy01gg80gm0m2040g1c7bn5rdbmctf9qf56xvjf7d0faygd350fgpwy9baqg9e6ffhmmd2z0dytj6m6yn4cud1ny2nbv4qt7mn0fcper50zv4g1kavyv7mxm4tc06xhq33n8mzn80c6y6knyntvxfcnh1k9aftvrrb43b3vrh7eed3h117z4rqcruj3c38nyj6mdaudgdz6eph2wb2zzjf9h1c0tz9np4nbpvj42m5k192gqb36cgzvhchmzr3d4xutv3knw31h9g28bfbaawdexzrtc1cjdpx7yz6x9v2wjjhhettq1ehm457vf1r1kuqmynyvfkr5hhv3vf3dmwqxh03kruk0y2zve3h39a9d748raemkjg02avxcm3ktrd1jaxnbcup69m1u0e9kuq3mffj0g0cq3rqyjqyr2491820c0g008",
  "1a": "8jze4merv08q6med3u21y460fjdcphkyuc858538mh48zu8az39t1vxdg9tadzun"
}
```

<a name="compact" />
### Compact Intermediate JSON

Frequently the source for a hashname is being sent in a context where there is a specific `ID` already known or agreed upon and only that key needs to be exchanged.  This can be more efficiently encoded with JSON that only includes the `intermediate hash` values (in BASE32) of the other IDs so that the correct hashname can be calculated.  Here's an example [packet encoding](../lob/) that includes the known ID key value as the BODY and the remaining intermediate hash values in the JSON:

```
HEAD:
{
  "3a": "gmamb66xcujtuzu9cm3ea9jjwxeyn2c0r8a4bz8y7b7n408bz630",
  "1a": "5vt3teqvjettaxkzkh47a7ta48e3hgp3bruern92xgh89am04h4g"
}
BODY: [2a's public key bytes]
```

The full and compact JSON formats use the same ID-as-name in order to ensure that they are only used in the correct contexts, they are never interchangable.
