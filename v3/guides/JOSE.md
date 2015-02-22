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

## LOB / Packet <-> JWS/JWE/JWT

LOB encoding directly encodes/decodes from JWT/JWS/JWE:

* JWT: {header json}[{claims json}[SIG]]

## Public Key Algorithms

Overlap between Cipher Set requirements and standard JOSE algorithms (JWA):

* [CS1a](e3x/cs/1a.md) compat w/ `HS256`, `A128KW`, propose alg `ES160` for secp160r1?
* [CS2a](e3x/cs/2a.md) is compatible with `RS256`, `RSA-OAEP`, `A256GCMKW` and `ES256`
* [CS3a](e3x/cs/2a.md) propose `ED25519` for NaCl?

## JWA/JWE for CSets

> possible to define a JWA for encryption for each cipher set message format?
