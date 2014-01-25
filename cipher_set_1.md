Cipher Set 1
============

This profile is the base algorithms selected for the telehash development process in 2013.


### RSA Key pair

The application instance [RSA public key](rsa) is used to sign the body of 
[`open`](#open) packets to authenticate the sender. Incoming [`open`](#open) 
packets also contain the sender's [Elliptic Curve](ecc) public key, which is 
encrypted with the recipient's RSA public key. This EC public key is also used 
to derive an [AES][] key which partially encrypts the packet (see below). As 
a result, the RSA private key of the recipient is required to decrypt the 
packet.
  
A minimum 2048 bit key size is required for RSA keys. Implementations should
refuse to communicate with a party using shorter keys.
  
The algorithms used are RSA with [OAEP][] (SHA-1, MFG1, aka PKCS1 v2) for encrypting the 
sender's Elliptic Curve public key, and RSA with a SHA-256 digest and PKCS1 v1.5
padding for signing the encrypted inner packet.
  
The RSA public key of the recipient of an [`open`](#open) packet must be known.
There are normally three ways that you learn about the public key of a 
hashname:
  
* Public keys of any seed members must be known.
* You receive and decrypt the sender's public key as part of an [`open`](#open)
  packet
* You receive and decrypt the public key of an introduced peer as part of a
  [`connect`](#connect) request

Top level packets do not have any addressing, instead relying on the ip/port 
corresponding to a single hashname. You may be able to determine the sender of 
an [`open`](#open) packet by attempting to verify the embedded RSA signature 
against known public keys.

### Elliptic Curve Diffie-Hellman
[Elliptic Curves](ecc) (EC) are used ephemerally to generate [`line`](#line) 
packet [AES][] keys. This is used to provide forward secrecy of line 
communication.

A public EC key pair is created when you send an [`open`](#open) packet. The 
[NIST P-256][] curve group (sometimes referred to as "prime256v1" or 
"secp256r1") is used for these keys. Due to fewer implementations, EC keys 
are exchanged in "[uncompressed][]" encoding.

The public key is exchanged encrypted with the recipient's 
[RSA public key](rsa) in an [`open`](#open) packet. It is also used as part of 
[`open`](#open) packet processing, as the [SHA-256][] digest of the public 
key is used to AES encrypt the inner packet.

These keys live until the line has been established or has failed. Generally 
retries of an [`open`](#open) packet will be identical (contain the same EC 
public key).

Once you have both sent and received [`open`](#open) packets, you use 
[Elliptic Curve Diffie-Hellman](ecdh) to derive a value that becomes that basis 
of the two line keys. The forming of the two line keys is described in the next
section.

<a name='aes' />
### AES
[AES][] is used to protect the inner data of an [`open`](#open) packet, as 
well as all line communication.

AES ciphers are created with a Counter algorithm mode ([CTR][]) and 
[PKCS1.5 padding](pkcs15). The counter is always zero, and not incremented as 
part of [channel](#channel) sequencing.

An Elliptic Curve public key is sent as part of an [`open`](#open) packet, 
encrypted with the recipient's [public RSA key](rsa). The [SHA-256][] digest of
this key is used to create an AES key which is used to encrypt the inner 
packet data, and another key is created to encrypt the attached signature.

Once [`open`](#open) packets have been exchanged, the two elliptic curves are 
used with [ECDH][] to derive a value used for the two line keys. A line key 
is formed by SHA-256 digest of the concatenation of the derived ECDH value, 
binary source line identifier, and binary destination line identifier.
This results in one key used to encrypt outgoing  packets, and a separate key 
used to decrypt incoming packets.

#### Packet Generation

A rough order of the steps needed create a new open packet are:

  1. Verify you have the recipient public key. If you do not have the
     recipient's public key, you may need to trigger the recipient to
     connect to you first. This is done via a [`connect`](#connect),
     described later.
  2. Generate an IV and a line identifier from a secure random source,
     both 16 bytes
  3. Generate a new elliptic curve keypair, based on the "nistp256"
     curve
  4. SHA-256 hash the public elliptic key to form the encryption key
     for the inner packet
  5. Form the inner packet containing a current timestamp `at`, `line`
     identifier, recipient `hashname`. Your own RSA public key is the packet BODY in the binary DER format.
  6. Encrypt the inner packet using the hashed public elliptic key from
     #4 and the IV you generated at #2 using AES-256-CTR.
  7. Create a signature from the encrypted inner packet using your own
     RSA keypair, a SHA 256 digest, and PKCSv1.5 padding
	8. Encrypt the signature using a new AES-256-CTR cipher with the same IV and a new SHA-256 key hashed from the public elliptic key + the line value (16 bytes from #5), then base64 encode the result as the value for the `sig` param.
  9. Create an `open` param, by encrypting the public elliptic curve key
     you generated (in uncompressed form, aka ANSI X9.63) with the recipient's RSA
     public key and OAEP padding.
  10. Form the outer packet containing the `open` type, `open` param, the
     generated `iv`, and the `sig` value.
  11. If you have also received an open packet from the recipient
      hostname, you may use it now to generate a `line` shared secret,
	  using the ECC public key they sent in their `open` packet and
	  Elliptic Curve Diffie-Hellman (ECDH).

An example of the generation of an open packet in Node.js is:

 ```js
 var eccSession = new eccKey("nistp256");

 var attached = {js:{}, body:myRSAPublicKey};
 attached.js.to = recipientHashname;
 attached.js.at = Date.now();
 var line = crypto.randomBytes(16);
 attached.js.line = line.toString("hex");
 var attachedRaw = packetEncode(attached);

 var open = {js:{type:"open"}};
 open.js.open = rsa(recipientRSAPublicKey).encrypt(eccSession.PublicKey, "PKCS1_OAEP_PADDING").toString("base64");

 var aesKey = crypto.createHash("sha256").update(eccSession.PublicKey).digest();
 var aesIV = crypto.randomBytes(16);
 var aesCipher = crypto.createCipheriv("AES-256-CTR", aesKey, aesIV);
 open.body = Buffer.concat([aesCipher.update(attachedRaw),aesCipher.final()]);
 open.js.iv = aesIV.toString("hex");
 aesKey = crypto.createHash("sha256").update(eccSession.PublicKey).update(line).digest();
 var aesCipher = crypto.createCipheriv("AES-256-CTR", aesKey, aesIV); 
 open.js.sig = Buffer.concat([aesCipher.update(rsa(myRSAPrivateKey).hashAndSign("sha256", open.body, "PKCS1_PADDING")),aesCipher.final()]).toString("base64");

 var openRaw = packetEncode(open);
 ```

#### Packet Processing
To process an `open` packet, the recipient will follow the following
rough order of steps:

  1. Using your private key and OAEP padding, decrypt the `open` param,
     extracting the ECC public key (in uncompressed form) of the sender
  2. Hash the ECC public key with SHA-256 to generate an AES key
  3. Decrypt the inner packet using the generated key and IV value with
     the AES-256-CTR algorithm.
  4. Verify the `to` value of the inner packet matches your hashname
  5. Extract the RSA public key of the sender from the inner packet BODY (binary DER format)
  6. SHA-256 hash the RSA public key to derive the sender's hashname
  7. Verify the `at` timestamp is newer
     than any other 'open' requests received from the sender.
  8. SHA-256 hash the ECC public key with the 16 bytes derived from the inner `line` hex value to generate an new AES key
  9. Decrypt the outer packet `sig` value using AES-256-CTR with the key from #8 and the same IV value as #3.
  10. Using the RSA public key of the sender, verify the signature (decrypted in #9) of
     the original (encrypted) form of the inner packet
  11. If an open packet has not already been sent to this hashname, do
     so by creating one following the steps above
  12. After sending your own open packet in response, you may now generate a `line` shared secret using the received and sent ECC public keys and Elliptic Curve Diffie-Hellman (ECDH).

Example open packet validation logic in node (simplified):

```js
// generate these to identify the line being created for each sender
var myEccSession = new eccKey("nistp256");
var myLineId = crypto.randomBytes(16);

var packet = packetDecode(openRaw);

var open = rsa(myRSAPrivateKey).decrypt(packet.js.open, "base64", "PKCS1_OAEP_PADDING");
var senderEccPublicKey = new eccKey("nistp256", open);

var aesKey = crypto.createHash('sha256').update(open).digest();
var aesIV = new Buffer(packet.js.iv, "hex");
var aesDecipher = crypto.createDecipheriv("AES-256-CTR", aesKey, aesIV);
var attached = packetDecode(Buffer.concat([aesDecipher.update(packet.body),aesDecipher.final()]);

var line = new Buffer(attached.js.line, "hex");
if(attached.js.to !== self.hashname || !line) return; // must match recipients hashname and have a line

var senderRSAPublicKey = deciphered.body;
var aesKey = crypto.createHash('sha256').update(open).update(line).digest();
var aesDecipher = crypto.createDecipheriv("AES-256-CTR", aesKey, aesIV);
var sig = Buffer.concat([aesDecipher.update(new Buffer(packet.js.sig, "base64")),aesDecipher.final()]);
var valid = rsa(senderRSAPublicKey).hashAndVerify("sha256", packet.body, sig, "PKCS1_PADDING");
if(!valid) return;

// generate the aes session key used for all of the line encryption
var ecdheSecret = myEccSession.deriveSharedSecret(senderEccPublicKey);
var lineEncryptKey = crypto.createHash("sha256")
  .update(ecdheSecret)
  .update(myLineId)
  .update(line)
  .digest();
var lineDecryptKey = crypto.createHash("sha256")
  .update(ecdheSecret)
  .update(line)
  .update(myLineId)
  .digest();
```


[rsa]:     https://en.wikipedia.org/wiki/RSA_(algorithm)
[sha-256]: https://en.wikipedia.org/wiki/SHA-2
[sybil]:   https://en.wikipedia.org/wiki/Sybil_attack
[ecc]:     https://en.wikipedia.org/wiki/Elliptic_curve_cryptography
[der]:     https://en.wikipedia.org/wiki/Distinguished_Encoding_Rules
[aes]:     https://en.wikipedia.org/wiki/Advanced_Encryption_Standard
[oaep]:    https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding
[ecdh]:    https://en.wikipedia.org/wiki/Elliptic_curve_Diffie–Hellman
[ctr]:     https://en.wikipedia.org/wiki/CTR_mode#Counter_.28CTR.29
[pkcs15]:  https://en.wikipedia.org/wiki/PKCS1

[nist p-256]: http://csrc.nist.gov/groups/ST/toolkit/documents/dss/NISTReCur.pdf
[uncompressed]: https://www.secg.org/collateral/sec1_final.pdf
