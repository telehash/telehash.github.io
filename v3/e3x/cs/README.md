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

Two endpoints must always create exchanges to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Every `CS` requires a strong/secure random number generator in order to minimally function, some of them may have additional entropy requirements during `CSK` generation.

The `0x00` `CSID` is not allowed and always considered invalid.

Any `CSID` of `0x0*` (`0x01` through `0x0f`) is for experimental use when developing custom Cipher Sets and should not be used in production.

<a name="reserved" />
### Reserved

All `CSIDs` with the mask of `11111000` (`0x18` through `0x1f`, `0x28` through `0x2f`, etc) are reserved and their usage is specified in this table:

| CSID          | Status | Crypto                        | Uses                  |
|---------------|--------|-------------------------------|-----------------------|
| [CS1a](1a.md) | Active | ECC-160, AES-128              | Embedded, Browser     |
| [CS1b](1b.md) | Draft  | ECC-256, AES-128              | Hardware-Accelerated  |
| [CS1c](1c.md) | Draft  | ECC-256k, AES-256             | Bitcoin-based Apps    |
| [CS2a](2a.md) | Active | RSA-2048, ECC-256, AES-256    | Server, Apps          |
| [CS2b](2b.md) | Draft  | RSA-4096, ECC-521, AES-256    | High-Security         |
| [CS3a](3a.md) | Active | [NaCl](http://nacl.cr.yp.to/) | Server, Apps          |


<a name="custom" />
### Custom

Any `CSID` with the mask of `11110111` (`0x10` through `0x17`, `0x20` through `0x27`, etc) are for custom application usage, these Cipher Sets definitions are entirely app-specific.  Implementations are responsible for ensuring that the ordering matches their security preferences.

<a name="jose" />
## JOSE Based

> [DRAFT](https://github.com/telehash/telehash.org/labels/draft)

The [JOSE standards](https://datatracker.ietf.org/wg/jose/charter/) can be used to implement an entire [Cipher Set](../e3x/cs/) dynamically, where [JWE and JWS encoding](../../lob.md#jwe) is used directly as the wire format for the encrypted message and channel packets.

Since the `CSID` is a simple ordering preference indicator and a JWE can internally signal its encryption algorithms, the [custom](#custom) range can be used by applications to map the chosen JWE `alg` value(s) to.

Applications using JOSE-based `CSIDs` should be careful to not use the features of JWE such as unprotected headers or multiple recipients that expose significantly more metadata to the network and untrusted entities, reducing the level of expected privacy.

* The `CSK` is a serialized JWK
* The message BODY is a JWE that contains a  requires both encryption and signing, so it is always a JWE of a JWS, and the JWS payload is the inner message packet (binary HEAD)
* If the handshake used ephemeral key agreement (ECDH) then channel JWEs can reference that agreement and contain the channel packet as the payload instead of a JWS

