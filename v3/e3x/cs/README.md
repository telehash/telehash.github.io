Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by e3x.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

A set always contains an endpoint public key cipher, an ephemeral public key cipher (for forward secrecy), and an authenticated streaming cipher.  Often a set uses the same public key algorithm for both the endpoint and epehemeral ciphers with different keys for each.

Each set can generate a single public key byte array called the Cipher Set Key (`CSK`) that is shared to other entities in order to generate outgoing or validate incoming messages. The `CSK` is a consistent value and must be tread as a binary octet string when transferred, imported, or exported.

Each `CSK` is identified with a unique identifier (`CSID`) that represents its overall selection priority. The `CSID` is a single byte, typically represented in lower case hex. The `CSIDs` are always sorted from lowest to highest preference.

| CSID          | Status | Crypto                        | Uses                  |
|---------------|--------|-------------------------------|-----------------------|
| [CS1a](1a.md) | Active | ECC-160, AES-128              | Embedded, Browser     |
| [CS1b](1b.md) | Draft  | ECC-256, AES-128              | Hardware-Accelerated  |
| [CS1c](1c.md) | Draft  | ECC-256k, AES-256             | Bitcoin-based Apps    |
| [CS2a](2a.md) | Active | RSA-2048, ECC-256, AES-256    | Server, Apps          |
| [CS2b](2b.md) | Draft  | RSA-4096, ECC-521, AES-256    | High-Security         |
| [CS3a](3a.md) | Active | [NaCl](http://nacl.cr.yp.to/) | Server, Apps          |

Two endpoints must always create exchanges to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Any `CSID` of `0x0*` (`0x01` through `0x0a`) are reserved for special use custom Cipher Sets whose definitions are entirely app-specific, the `0x00` `CSID` is not allowed and always considered invalid.

Every `CS` requires a strong/secure random number generator in order to minimally function, some of them may have additional entropy requirements during `CSK` generation.


## Exchanging CSKs

Cipher Sets are designed to be combined together for use as [hashnames](../../hashname/) so that one local instance can simultaneously use multiple `CS`, always selecting the best one to use based on what is available to another instance.

<a name="json" />
### JSON

When sharing `CS` keys in JSON always use [base32](http://tools.ietf.org/html/rfc4648#section-3.2) encoding (lower-case, no padding) of the binary public key value to create strings that are safe to use everywhere.

One or more Cipher Set Keys are represented in a JSON object using the `CSID` hex string as the key with a base32 string `VALUE`.

```json
{
  "3a":"eg3fxjnjkz763cjfnhyabeftyf75m2s4gll3gvmuacegax5h6nia",
  "1a": "an7lbl5e6vk4ql6nblznjicn5rmf3lmzlm"
}
```

<a name="packet" />
### Packet (binary key)

Frequently the source for a hashname is being sent in a context where there is a specific `CSID` already known or agreed upon and only that single `CS` public key needs to be exchanged.  This can be consistently (and often more efficiently) encoded as a single [packet](../../lob/).

The packet's JSON header that only includes the 32-byte `intermediate hash` values of the other `CSIDs` as base32 encoded strings, and the public key binary bytes of the active `CSID` in the `BODY` of the packet:

```
HEAD:
{
  "3a": "eg3fxjnjkz763cjfnhyabeftyf75m2s4gll3gvmuacegax5h6nia",
  "2a":true,
  "1a": "ckczcg2fq5hhaksfqgnm44xzheku6t7c4zksbd3dr4wffdvvem6q"
}
BODY: [2a's public key binary bytes]
```

When the context of which `CSID` is already known, that `CSID`'s `true` value in the JSON is not required to identify which key is in the `BODY`.

<a name="string" />
### String

At times it is necessary to encode all of the `CS` key bytes to be transferred Out-Of-Band in a simplified string context with minimal special characters.  To maximize compatibility between different implementations, whenever possible a string encoding should mimic the JSON format, including pairs of 2-character `CSIDs` with their base32 encoded key bytes.  When minimizing the use of special characters, the hex `CSID` may directly prefix the base32 string as it is always a fixed length of 2, and the delimeter character can be any non-alphanumeric that is available in the given context, such as `.`, `-`, `,`, etc.

See [URI](../../uri.md) for an example of this style of mapping to a query string: `link://192.168.0.55:42424/?1a=ammitozqsp4bdlvfjedusc24nlo2ndqbm4&3a=nst5jzocozz47kstrtgp6fxxifygobg5fdrb2niu2i5fytpxrj5q`
