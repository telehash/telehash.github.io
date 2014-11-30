Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by e3x.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The `CSID` is a single byte, represented in lower case hex. The CSIDs are always sorted from lowest to highest preference.

| CSID          | Status | Crypto                        | Uses                  |
|---------------|--------|-------------------------------|-----------------------|
| [CS1a](1a.md) | Active | ECC-160, AES-128              | Embedded, Browser     |
| [CS1b](1b.md) | Draft  | ECC-256, AES-128              | Hardware-Accelerated  |
| [CS1c](1c.md) | Draft  | ECC-256k, AES-256             | Bitcoin-based Apps    |
| [CS2a](2a.md) | Active | RSA-2048, ECC-256, AES-256    | Server, Apps          |
| [CS2b](2b.md) | Draft  | RSA-4096, ECC-521, AES-256    | High-Security         |
| [CS3a](3a.md) | Active | [NaCl](http://nacl.cr.yp.to/) | Server, Apps          |

Two endpoints must always create exchanges to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Any `CSID` of "0*" ("01" through "0a") are reserved for special use custom Cipher Sets whose definitions are entirely app-specific, the "00" `CSID` is not allowed and always considered invalid.

## Exchanging CS Keys

Cipher Sets are designed to work well with [hashnames](../../hashname/), which use [base32](http://tools.ietf.org/html/rfc4648#section-3.2) encoding (lower-case, no padding) to create strings that are safe to use everywhere.

One or more Cipher Set Keys can be encoded in JSON using the same base32 encoding and the CSID as the key.

<a name="json" />
### JSON

The source keys to calculate a hashname may be exchanged and represented as a complete JSON object where the ID is in HEX and the public key is BASE32 encoded:

```json
{
  "3a":"eg3fxjnjkz763cjfnhyabeftyf75m2s4gll3gvmuacegax5h6nia",
  "1a": "an7lbl5e6vk4ql6nblznjicn5rmf3lmzlm"
}
```

<a name="packet" />
### Packet 

Frequently the source for a hashname is being sent in a context where there is a specific `CSID` already known or agreed upon and only that key needs to be exchanged.  This can be consistently (and often more efficiently) encoded as a [packet](../../lob/) with JSON that only includes the `intermediate hash` values (in base32) of the other CSIDs and the raw key bytes of the active CSID in the BODY:

```
HEAD:
{
  "3a": "eg3fxjnjkz763cjfnhyabeftyf75m2s4gll3gvmuacegax5h6nia",
  "2a":true,
  "1a": "ckczcg2fq5hhaksfqgnm44xzheku6t7c4zksbd3dr4wffdvvem6q"
}
BODY: [2a's public key bytes]
```

When the context of which CSID is already known, that CSID's `true` value in the JSON is not required to identify which key is in the BODY.

The packet JSON uses the same CSID-as-name in order to ensure that it is only used in this context and not mistaken as the JSON for the full keys.

<a name="string" />
### String

At times it is necessary to encode all of the CS key bytes to be transferred Out-Of-Band in a simplified string context with minimal special characters.  To maximize compatibility between different implementations, whenever possible a string encoding should mimic the JSON format, including pairs of 2-character CSIDs with their base32 encoded key bytes.  When minimizing the use of special characters, the hex CSID may directly prefix the base32 string as it is always a fixed length of 2, and the delimeter character can be any non-alphanumeric that is available in the given context, such as `.`, `-`, `,`, etc.

See [URI](../../uri.md) for an example direct mapping to a query string.

