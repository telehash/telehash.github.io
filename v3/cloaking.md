# Cloaking - Network Obfuscation

In situations where the network is performing any packet filtering or inspection it is important to add as much random noise as possible to all bytes sent across an untrusted network, so telehash employs a simple cloaking technique that can be used on any transport and is recommended for all unencrypted ones by default (such as TCP and UDP).

The cloaking technique simply requires an extra processing step that adds an 8 byte nonce to every packet and randomizes 100% of the bytes on the wire.  It is not a guarantee that the packets cannot be filtered but it makes standard byte pattern identification significantly more difficult.  Future designs will continually increase this difficulty.

## Per-Packet

Due to all encrypted packets beginning with single zero byte (0x00) when sent on the wire (since they have no JSON encoded), cloaking uses a first byte that is any non-zero value (0x01 to 0xff).

Cloaking is performed using the [ChaCha20 cipher](http://cr.yp.to/chacha.html) and choosing a random nonce of 8 bytes that does not begin with 0x00. The key is a fixed well-known 32 byte value of `d7f0e555546241b2a944ecd6d0de66856ac50b0baba76a6f5a4782956ca9459a` (hex encoded), which is the SHA-256 of the string `telehash`.

The resulting cloaked packet is the concatenation of the 8-byte nonce and the ChaCha20 ciphertext output.  Once decloaked, the ciphertext should be processed as another packet, which may be a raw encrypted packet (0x00) or may be another cloaked one. A random number of multiple cloakings should always be used to obfuscate the original packet's size.

## Accept both

Any endpoint may begin by sending both cloaked and uncloaked packets, and falling back to just uncloaked if the recipient doesn't support them.  When receiving cloaked packets, the recipient should always send cloaked ones in response.