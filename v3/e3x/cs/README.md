# Cipher Sets

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by E3X.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

A set always contains an endpoint public key cipher, an ephemeral public key cipher (for forward secrecy), and an authenticated streaming cipher.  Often a set uses the same public key algorithm for both the endpoint and epehemeral ciphers with different keys for each.

<a name="csk" />
## Cipher Set Key (CSK)

Each set can generate a single public key byte array called the Cipher Set Key (`CSK`) that is shared to other entities in order to generate outgoing or validate incoming messages.

The `CSK` is a consistent opaque value intended for use only by a given `CS`.  It must be tread as an arbitrary *binary octet string* when transferred, imported, or exported.

<a name="csid" />
## Cipher Set ID (CSID)

Each `CSK` is identified with a unique identifier (`CSID`) that represents its overall selection priority. The `CSID` is a single byte, typically represented in lower case hex. The `CSIDs` are always sorted from lowest to highest preference.

Two endpoints must always create [exchanges](../exchange.md) to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Every `CS` requires a strong/secure random number generator in order to minimally function, some of them may have additional entropy requirements during `CSK` generation.

The `0x00` `CSID` is not allowed and always considered invalid.

Any `CSID` of `0x0*` (`0x01` through `0x0f`) is for experimental use when developing custom Cipher Sets and should not be used in production.

<a name="reserved" />
### Reserved

All `CSIDs` with the mask of `11111000` (`0x18` through `0x1f`, `0x28` through `0x2f`, etc) are reserved and their usage is specified in this table:

| CSID          | Status | Crypto                         | Uses                  |
|---------------|--------|--------------------------------|-----------------------|
| [CS1a][]      | Active | ECC-160, AES-128               | Embedded, Browser     |
| [CS1b][]      | Draft  | ECC-256, AES-128               | Hardware-Accelerated  |
| [CS1c][]      | Draft  | ECC-256k, AES-256              | Bitcoin-based Apps    |
| [CS2a][]      | Active | RSA-2048, ECC-256, AES-256     | Server, Apps          |
| [CS2b][]      | Draft  | RSA-4096, ECC-521, AES-256     | High-Security         |
| [CS3a][]      | Active | Curve25519, XSalsa20, Poly1305 | Server, Apps          |


<a name="custom" />
### Custom

Any `CSID` with the mask of `11110111` (`0x10` through `0x17`, `0x20` through `0x27`, etc) are for custom application usage, these Cipher Sets definitions are entirely app-specific.  Implementations are responsible for ensuring that the custom `CSIDs` match their security preferences.

See the [JOSE-based](https://github.com/telehash/telehash.org/blob/master/v3/e3x/cs/jose.md) mapping draft for example custom `CSIDs`.

[CS1a]: 1a.md
[CS1b]: https://github.com/telehash/telehash.org/blob/master/v3/e3x/cs/1b.md
[CS1c]: https://github.com/telehash/telehash.org/blob/master/v3/e3x/cs/1c.md
[CS2a]: 2a.md
[CS2b]: https://github.com/telehash/telehash.org/blob/master/v3/e3x/cs/2b.md
[CS3a]: 3a.md
