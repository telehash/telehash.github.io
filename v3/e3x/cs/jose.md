## JOSE Based Custom

> [DRAFT](https://github.com/telehash/telehash.org/labels/draft)

The [JOSE standards](https://datatracker.ietf.org/wg/jose/charter/) can be used to implement an entire Cipher Set dynamically, where [JWE and JWS encoding](../../lob.md#jwe) is used directly as the wire format for the encrypted message and channel packets.

Since the `CSID` is a simple ordering preference indicator and a JWE can internally signal its encryption algorithms, the [custom](../cs/#custom) range can be used by applications to map the chosen JWE `alg` value(s) to.

Applications using JOSE-based `CSIDs` should be careful to not use the features of JWE such as unprotected headers or multiple recipients that expose significantly more metadata to the network and untrusted entities, reducing the level of expected privacy.

* The `CSK` is a serialized JWK
* The message BODY is a JWE that contains a  requires both encryption and signing, so it is always a JWE of a JWS, and the JWS payload is the inner message packet (binary HEAD)
* If the handshake used ephemeral key agreement (ECDH) then channel JWEs can reference that agreement and contain the channel packet as the payload instead of a JWS

