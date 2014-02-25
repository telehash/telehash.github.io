## Hashnames
Every instance of an application has a unique public address that is called
its `hashname`. Any application instance can use the DHT to find
others by knowing only their hashname. By default there is a single global
DHT to support this discovery and connectivity, but Telehash also supports applications creating their own private
DHTs for other uses.

The hashname is a 64-character lower case hex string, formed by the [SHA-256][] digest of the fingerprints of a set of public keys that is generated the first time an application starts, an example hashname is `2dbf1ce81180d9ed9258e3e8729ba642c8ab2a31268d31cd2c7ffe8693e3a02e`.

The details of how the hashname is calculated from the generated keys is described in the [Cipher Sets](cipher_sets.md#hashnames) document.

## Hashname Calculation

A hashname is the [SHA-256][] of one or more public key fingerprints.  The set of fingerprints making up a hashname is called its `parts` and are required to calculate it.  A hashname may be created from just one CS or up to 8 different ones, each contributing its string fingerprint.

Here is an example JSON `parts` object composed of two Cipher Sets:

```json
{
  "2a": "bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe",
  "1a": "a5c8b5c8a630c84dc01f92d2e5af6aa41801457a"
}
```

To calculate the hashname the parts are sorted in ascending order by their CSID, and each part contributes two values, the CSID and the fingerprint.  So the above example after sorting would result in the following array of strings:

```json
["1a","a5c8b5c8a630c84dc01f92d2e5af6aa41801457a","2a","bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe"]
```

Each string is individually hashed using [SHA-256][], and then all of the calculated digests are then combined again using SHA-256 to result in the unique hashname.  In this example, the result is "7e650a1094269691c0275f65c605e3cf1b191c5f73a1398a368b84269b2d92fc".

Here is example node.js javascript to do the example calculation:

```js
var crypto = require("crypto");
var parts = {"2a":"bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe","1a":"a5c8b5c8a630c84dc01f92d2e5af6aa41801457a"};
var digests = [];
Object.keys(parts).sort().forEach(function(id){
  digests.push(crypto.createHash("sha256").update(id).digest());
  digests.push(crypto.createHash("sha256").update(parts[id]).digest());
});
var hash = crypto.createHash("sha256");
digests.forEach(function(digest){
  hash.update(digest);
});
var hashname = hash.digest("hex");
```
