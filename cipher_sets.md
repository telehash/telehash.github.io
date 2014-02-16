Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by Telehash.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The CSIDs are sorted alphanumerically from lowest to highest preference.

* [CS1][] - Minimum lightweight set for use primarily with embedded devices, required for most uses
* [CS1r][] - Historical set from telehash development in 2013 using RSA (2048), ECC (P-256), and AES (256)
* [CS2][] - Modern set using [NaCl](http://nacl.cr.yp.to/)

Each CS contributes two values that are used within the protocol, a `fingerprint` and a `key`.  The `fingerprint` is used to calculate the hashname it's part of, and the `key` is the binary public key that is exchanged between instances.

<a name="hashnames" />
## Hashname Calculation

A hashname is the [SHA-256][] of one or more public key fingerprints.  The set of fingerprints making up a hashname is called its `parts` and are required to calculate it.  A hashname may be created from just one CS or multiples of them, each contributing its string fingerprint.

Here is an example JSON `parts` object composed of two Cipher Sets:

```json
{
  "1r": "bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe",
  "1": "a5c8b5c8a630c84dc01f92d2e5af6aa41801457a"
}
```

To calculate the hashname each fingerprint is concatenated in alphabetical ascending order by it's CSID, so the combined string from this example would be "a5c8b5c8a630c84dc01f92d2e5af6aa41801457abf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe". This concatenated string is then hashed using [SHA-256][] to derive the unique hashname, in this example the result is "10f458f215524fdcbc5853fff77fbd6624536332f6a2d64eaee06985536db12c".

Here is example node.js javascript to do the example calculation:

```js
var parts = {"1r":"bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe","1":"a5c8b5c8a630c84dc01f92d2e5af6aa41801457a"};
var sorted = Object.keys(parts).sort();
var values = sorted.map(function(id){return parts[id.toString()]});
var hashname = require("crypto").createHash("sha256").update(values.join("")).digest("hex");
```

## CSID Selection

Two hashnames can only start communicating by using the same CSID, and that CSID must always be the "highest" one in alphanumeric sort order.  The CSIDs of "1", "1r", and "2" sort in that order and "2" is the highest, so two hashnames supporting all three must use CS2.





[sha-256]: https://en.wikipedia.org/wiki/SHA-2
[cs1]: cipher_set_1.md
[cs1r]: cipher_set_1r.md
[cs2]: cipher_set_2.md
