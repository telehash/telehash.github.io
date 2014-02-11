Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by Telehash.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The CSIDs are sorted alphanumerically from lowest to highest preference.

* [CS-1][] - Minimum lightweight set for use primarily with embedded devices, required for most uses
* [CS-1r][] - Historical set from telehash development in 2013 using RSA (2048), ECC (P-256), and AES (256)
* [CS-2][] - Newer set based on Curve25519

<a name="hashnames" />
## Hashname Calculation

A hashname is the [SHA-256][] of the one or more fingerprints of CS keys, called `parts`.  Each CS specifies a string fingerprint of it's public key, and these parts are all combined to create the unique hashname used for addressing in Telehash.

Here is an example JSON `parts` object defining two CS keys:

```json
{
  "1r": "bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe",
  "1": "a5c8b5c8a630c84dc01f92d2e5af6aa41801457a"
}
```

Each fingerprint is concatenated in numerical ascending order by the CSID, so the combined string from this example would be "861b9311b1ad8ec9ae810f454745d37b46355604637e068cea6a8131191b7d4fbf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe". This concatenated string is then hashed to derive the hashname of the node, in this example the resulting hashname is "2dbf1ce81180d9ed9258e3e8729ba642c8ab2a31268d31cd2c7ffe8693e3a02e".

Here is example node.js javascript to do the example calculation:

```js
var parts = {"1r":"bf6e23c6db99ed2d24b160e89a37c9cd183fb61afeca40c4bc378cf6e488bebe","1":"a5c8b5c8a630c84dc01f92d2e5af6aa41801457a"};
var sorted = Object.keys(parts).sort();
var values = sorted.map(function(id){return parts[id.toString()]});
var hashname = require("crypto").createHash("sha256").update(values.join("")).digest("hex");
```


[sha-256]: https://en.wikipedia.org/wiki/SHA-2
[cs-1]: cipher_set_1.md
[cs-1r]: cipher_set_1r.md
[cs-2]: cipher_set_2.md
