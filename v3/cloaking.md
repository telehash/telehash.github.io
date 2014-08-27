# Cloaking - Network Obfuscation

In situations where the network is performing any packet filtering or inspection it is important to add as much disguise to all bytes sent in the open, so telehash employs a simple cloaking technique that can be used on any transport.

## Per-Packet

Due to all encrypted packets using the prefix 0x0000 or 0x0001 when sent on the wire, cloaking employs the rest of the values.  When any wire packet is received that begins with any two bytes other than the known values it is attempted to be de-cloaked.

Cloaking is performed using the Salsa20 cipher and choosing a random nonce of 8 bytes that does not begin with 0x0000 or 0x0001, and using the recipients public hashname (32 bytes) as the key.  Since the source is always known to begin with the byte 0x00, that byte may be replaced with a random number (0-256) indicating the amount of additional random padding appended to the packet that should be ignored.

## Optional

Any endpoint may begin by sending cloaked packets, and falling back to uncloaked if the recipient doesn't support them.  When receiving cloaked packets, the recipient should always send cloaked ones in response.