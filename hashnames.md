## Hashnames
Every instance of an application has a unique public address that is called
its `hashname`. Any application instance can use the DHT to find
others by knowing only their hashname. By default there is a single global
DHT to support this discovery and connectivity, but Telehash also supports applications creating their own private
DHTs for other uses.

The hashname is a 64-character lower case hex string, formed by the [SHA-256][] digest of the fingerprints of a set of public keys that is generated the first time an application starts, an example hashname is `2dbf1ce81180d9ed9258e3e8729ba642c8ab2a31268d31cd2c7ffe8693e3a02e`.

The details of how the hashname is calculated from the generated keys is described in the [Cipher Sets](cipher_sets.md#hashnames) document.
