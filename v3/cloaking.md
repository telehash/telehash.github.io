# Cloaking - Network Obfuscation

In situations where the network is performing any packet filtering or inspection it is important to add as much disguise as possible to all bytes sent across an untrusted network, so telehash employs a simple cloaking technique that can be used on any transport and is recommended for unencrypted ones by default (such as TCP and UDP).

The cloaking technique simply requires an extra processing step in order to make pattern identification more difficult, it does not try to prevent it entirely.  Future designs will continually increase this difficulty.

## Per-Packet

Due to all encrypted packets beginning with single zero byte (0x00) when sent on the wire (since they have no JSON encoded), cloaking uses a first byte that is any non-zero value (0x01 to 0xff).

Cloaking is performed using the Salsa20 cipher and choosing a random nonce of 8 bytes that does not begin with 0x00. The key is a fixed well-known 32 byte value of `d7f0e555546241b2a944ecd6d0de66856ac50b0baba76a6f5a4782956ca9459a` (hex encoded), which is the SHA-256 of the string `telehash`.

The resulting cloaked packet is the concatenation of the 8-byte nonce and the Salsa20 ciphertext output.  Once decloaked, the ciphertext should be processed as another packet, which may be a raw encrypted packet (0x00) or may be another cloaked one. A random number of multiple cloakings should always be used to obfuscate the original packet's size.

## Optional

Any endpoint may begin by sending both cloaked and uncloaked packets, and falling back to just uncloaked if the recipient doesn't support them.  When receiving cloaked packets, the recipient should always send cloaked ones in response.