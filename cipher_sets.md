Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by Telehash.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The CSID is a single byte, represented in lower case hex. The CSIDs are always sorted from lowest to highest preference.

* [CS1a][] - Minimum lightweight set designed for use with embedded devices and low resource environments
* [CS2a][] - Historical set from 2013 using RSA (2048), ECC (P-256), and AES (256)
* [CS3a][] - Modern set using [NaCl](http://nacl.cr.yp.to/)

Each CS contributes two values that are used within the protocol, a `fingerprint` and a `key`.  The `fingerprint` is used to calculate the hashname it's part of, and the `key` is the binary public key that is exchanged between instances.

Two hashnames must always initiate a line to each other using the highest shared CSID between them.  Apps may choose which one or more CSIDs they want to support when they create a new hashname and know that a lower one will only ever be used to communicate with hashnames that only support that CS.

Any CSID of "0*" ("00" through "0a") are reserved for special case custom Cipher Sets who's definitions are entirely app-specific.

<a name="hashnames" />
## Hashname Calculation

A hashname is the [SHA-256][] of one or more public key fingerprints.  The set of fingerprints making up a hashname is called its `parts` and are required to calculate it.  A hashname may be created from just one CS or multiples of them, each contributing its string fingerprint.

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




[sha-256]: https://en.wikipedia.org/wiki/SHA-2
[cs1a]: cipher_set_1a.md
[cs2a]: cipher_set_2a.md
[cs3a]: cipher_set_3a.md
