# Hashnames

A _hashname_ is a unique fingerprint to represent the union of one or more public keys of different formats ([Cipher Sets](e3x/cs/)), providing consistent verifiable endpoint addresses when utilizing multiple different public-key algorithms. This enables a compatibility layer for improving the algorithms used so that any application can increase security in newer versions while still being able to represent itself securely to older ones.

A _hashname_ can be viewed as a portable, secure, virtual equivalent of a [MAC address](http://en.wikipedia.org/wiki/MAC_address), since it is a universally unique identifier for a network endpoint that is also self-generated and cryptographically verifiable.

The value is always a [base 32](base32.md) encoded string that is 52 characters long.  When decoded it is always a 32 byte binary value, which corresponds to the result of a [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hash digest.  An example _hashname_ is `kw3akwcypoedvfdquuppofpujbu7rplhj3vjvmvbkvf7z3do7kkq`.

## Hashname Generation

A hashname is calculated by combining one or more Cipher Set Keys ([CSK](e3x/cs/)) through multiple rounds of [SHA-256](http://en.wikipedia.org/wiki/SHA-2) hashing.

The generation has three distinct steps, all of them operating on binary/byte inputs and outputs:

1. Every `CSK` is identified by a single unique `CSID` and sorted by it from low to high (e.g. `CS1a` is lower then `CS3a`)
2. Each `CSK` is hashed into _intermediate_ digest values
3. Roll-up hashing of the `CSIDs` and _intermediate_ values generates the final 32-byte digest

Any _hashname_ generation software does not need to know or understand the Cipher Sets or support the algorithms defined there, it only has to do the consistent hashing of any given set of `CSID` and `CSK` pair inputs.

The _intermediate_ digest values may be used and exchanged directly instead of the original `CSK` to minimize the amount of data required to calculate and verify a _hashname_ with multiple keys.

### Final Rollup

To calculate the _hashname_ the _intermediate_ digests are sequentially hashed in ascending order by their `CSID`. Each one contributes two values: the single byte `CSID` value and the 32 byte _intermediate_ digest value. The calculated hash is rolled up, wherein each resulting 32 byte binary output is concatenated with the next binary value as the input. An example calculation would look like (in pseudo-code):

```js
hash = sha256(0x1a)
hash = sha256(hash + 0x21b6...f350)
hash = sha256(hash + 0x3a)
hash = sha256(hash + 0x97d8...7101)
final = hash
```

Here is a working example in node.js to do the calculation, results in `27ywx5e5ylzxfzxrhptowvwntqrd3jhksyxrfkzi6jfn64d3lwxa`

```js
var crypto = require("crypto");
var base32 = require("rfc-3548-b32");
var keys = {
  "3a": "eg3f...6nia",
  "1a": "an7lbl5e6vk4ql6nblznjicn5rmf3lmzlm"
};

var rollup = new Buffer(0);
Object.keys(keys).sort().forEach(function(id) {
  rollup = crypto.createHash("sha256")
    .update(Buffer.concat([
      rollup,
      new Buffer(id, "hex")])
    ).digest();
  var intermediate = crypto.createHash("sha256")
    .update(new Buffer(
      base32.decode(keys[id]),
      "binary")
    ).digest();
  rollup = crypto.createHash("sha256")
    .update(Buffer.concat([
      rollup,
      intermediate])
    ).digest();
});

// normalize to lower case and remove padding
var hashname = base32.encode(rollup)
  .toLowerCase()
  .split("=").join("");

// prints 27yw...lwxa
console.log(hashname);
```
