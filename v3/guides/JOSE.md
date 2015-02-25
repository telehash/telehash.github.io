# JOSE - JSON Object Signing and Encryption
==========================

> WIP

[JOSE](https://datatracker.ietf.org/wg/jose/charter/) and [OpenID Connect](http://openid.net/connect/) interop/usage guide.

By using telehash as a strongly encrypted and stable private device/endpoint identifier, it can significantly contribute to and interop with higher level user/entity identification and authorization processes.

## Identity Tokens (JWT)

* supported payload for [handshakes](e3x/handshake.md)
* can be used for additional pairing context

## Dynamic Client Registration

> Show how this can be performed over telehash instead of or in addition to TLS for improved security

## Hashname Claims

> Define a standard way to include one or more hashnames in the standard OIDC claims for dynamic binding.

## JWT (JWS/JWE) to LOB Encoding

[LOB encoding](../lob/) is used to directly map to and from JWT/JWS/JWE compact serialization.

### JWS

Any [JWS](https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-41) can be mapped to two packets (one attached to another):

* HEAD: {JWS Protected Header (JWT Header)}
* BODY: attached LOB
  * HEAD: {JWS Payload (JWT Claims)}
  * BODY: JWS Signature (binary)

### JWE

Any [JW#](https://tools.ietf.org/html/draft-ietf-jose-json-web-encryption-40) can be mapped to three packets (as attached descendents):

* HEAD: {JWE Protected Header}
* BODY: attached LOB
  * HEAD: {JWE JSON (Encrypted Key, IV, Tag, AAD)}
  * BODY: attached LOB
    * HEAD: {optional unprotected header}
    * BODY: JWE Ciphertext (binary)

Example:

```
{"alg":"RSA-OAEP","enc":"A256GCM"}
BODY: {"aad":"","iv":"","tag":"","encrypted_key":""}
  BODY: (no header)
    BODY: ciphertext
```

## Public Key Algorithms

Overlap between Cipher Set requirements and standard JOSE algorithms (JWA):

* [CS1a](e3x/cs/1a.md) compat w/ `HS256`, `A128KW`, propose alg `ES160` for secp160r1?
* [CS2a](e3x/cs/2a.md) is compatible with `RS256`, `RSA-OAEP`, `A256GCMKW` and `ES256`
* [CS3a](e3x/cs/2a.md) propose `ED25519` for NaCl?

## JOSE Cipher Sets

The JOSE stack can be used to implement an entire [Cipher Set](../e3x/cs/) in a generic way, where a JWE is the wire format for the encrypted message and channel packets.

Since the CSID is a simple ordering preference indicator and a JWE can internally signal its encryption algorithms, any reserved CSID can be used by applications to map their chosen `alg` value(s) to.

Applications using JOSE-based CSIDs should be careful to not use the features of JWE such as unprotected headers or multiple recipients that expose significantly more metadata to the network and untrusted entities, reducing the level of expected privacy.

> todo formalize and examples

* An e3x message requires both encryption and signing, so it is a JWE of a JWS payload.
* A handshake includes the sender's key, attached as a JWK.
* The channel encryption does not require signing, so it is just a JWE with the channel packet as the payload.
