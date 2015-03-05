# JOSE - JSON Object Signing and Encryption

[JOSE](https://datatracker.ietf.org/wg/jose/charter/) interop guide.


## JWS/JWT/JWE to LOB Encoding

[LOB encoding](../lob/) is directly mapped to and from JWS/JWE compact serialization.  The LOB encoding is simply a consistent binary translation of a JWS/JWE, there is no semantic changes to the contents in either direction.

### JWS

Any [JWS](https://tools.ietf.org/html/draft-ietf-jose-json-web-signature-41) can be mapped to two LOB packets (one attached to another):

* HEAD: {JWS Protected Header (JWT Header)}
* BODY: attached LOB
  * HEAD: {JWS Payload (JWT Claims)}
  * BODY: JWS Signature (binary)

### JWE

Any [JW#](https://tools.ietf.org/html/draft-ietf-jose-json-web-encryption-40) can be mapped to three LOB packets (as attached descendents):

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

## JOSE-Based Cipher Sets

The JOSE stack can be used to implement an entire [Cipher Set](../e3x/cs/) dynamically, where a JWE is used directly as the wire format for the encrypted message and channel packets.

Since the `CSID` is a simple ordering preference indicator and a JWE can internally signal its encryption algorithms, any [custom CSID](../e3x/cs/#custom) can be used by applications to map their chosen `alg` value(s) to.

Applications using JOSE-based `CSIDs` should be careful to not use the features of JWE such as unprotected headers or multiple recipients that expose significantly more metadata to the network and untrusted entities, reducing the level of expected privacy.

> todo formalize and examples

* The CS public key bytes are a JWK
* An e3x message requires both encryption and signing, so it is always a JWE of a JWS payload.
* If the handshake used ephemeral key agreement (ECDH) then channel encryption can reference that agreement and does not require signing (it is just a JWE with the channel packet as the payload), otherwise channel encryption is identical to a message

