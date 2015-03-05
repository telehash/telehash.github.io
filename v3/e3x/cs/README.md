# Cipher Sets

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by e3x.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

A set always contains an endpoint public key cipher, an ephemeral public key cipher (for forward secrecy), and an authenticated streaming cipher.  Often a set uses the same public key algorithm for both the endpoint and epehemeral ciphers with different keys for each.

Each set can generate a single public key byte array called the Cipher Set Key (`CSK`) that is shared to other entities in order to generate outgoing or validate incoming messages. The `CSK` is a consistent value and must be tread as a binary octet string when transferred, imported, or exported.

Each `CSK` is identified with a unique identifier (`CSID`) that represents its overall selection priority. The `CSID` is a single byte, typically represented in lower case hex. The `CSIDs` are always sorted from lowest to highest preference.

The `0x00` `CSID` is not allowed and always considered invalid.

All `CSIDs` with the mask of `11111000` (`0x18` through `0x1f`, `0x28` through `0x2f`, etc) are reserved and their usage is specified in this table:

| CSID          | Status | Crypto                        | Uses                  |
|---------------|--------|-------------------------------|-----------------------|
| [CS1a](1a.md) | Active | ECC-160, AES-128              | Embedded, Browser     |
| [CS1b](1b.md) | Draft  | ECC-256, AES-128              | Hardware-Accelerated  |
| [CS1c](1c.md) | Draft  | ECC-256k, AES-256             | Bitcoin-based Apps    |
| [CS2a](2a.md) | Active | RSA-2048, ECC-256, AES-256    | Server, Apps          |
| [CS2b](2b.md) | Draft  | RSA-4096, ECC-521, AES-256    | High-Security         |
| [CS3a](3a.md) | Active | [NaCl](http://nacl.cr.yp.to/) | Server, Apps          |


Any `CSID` of `0x0*` (`0x01` through `0x0f`) is for experimental use when developing custom Cipher Sets and should not be used in production.

Any `CSID` with the mask of `11110111` (`0x10` through `0x17`, `0x20` through `0x27`, etc) are reserved for custom application usage, the Cipher Sets definitions are entirely app-specific.  Implementations are responsible for ensuring that the ordering matches their security preferences.

Two endpoints must always create exchanges to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Every `CS` requires a strong/secure random number generator in order to minimally function, some of them may have additional entropy requirements during `CSK` generation.


