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


