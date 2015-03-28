# Packet Chunking

Sending sequential [LOB](lob.md) packet byte arrays over streaming transports (such as TCP/TLS) requires additional framing to indicate the size of each one. Framing is also necessary to break packets into smaller pieces for low MTU transports (such as Bluetooth LE and 802.15.4 based ) and to signal flow control (Serial).

LOB chunking is a minimalist byte-encoding technique describing how to break any packet into multiple sequential chunks and re-assemble them into packets with minimum overhead. There is no CRC or other consistency checks as it is only designed to carry encrypted packets with their own internal validation and be implemented as a library utility for many transports with differing needs.

## Format

A packet is broken into fragments of size 1 to 255 bytes each, and each fragment is prefixed with a single byte representing its length, together this is called a `chunk`. The sequence of one or more chunks is terminated with a zero-length terminator chunk, a single null byte.

Sequential chunks received that have any size should be appended to a buffer until the zero terminator chunk, at which point the buffer should be checked for a valid packet or discarded.  Any lone zero chunks with no buffer should just be ignored.

Chunk size of 5:
```
packet = [0,1,2,3,4,5,6,7,8,9]; // 10 byte packet
chunk1 = [4,0,1,2,3]; // 4-byte fragments
chunk2 = [4,4,5,6,7];
chunk3 = [2,8,9];
chunk4 = [0]; // terminator
```

When using chunks for fixed frame sizes the terminator should be included in the last frame if there's space, so the last frame for the example would be `[2,8,9,0]`.

## Acks

At any point a zero-length chunk may be sent in response to a full incoming chunk and used by a transport for sending acknowedgement or keepalive signals.  Some transports may require this to manage flow control, buffer sizes, and detect timeouts faster.

This ack mechanism should not be used to try and create a reliable transport at this level, packets are expected to be safe to send unreliably and will internally be retransmitted when necessary.

## Transport Notes

* TCP / TLS - default chunk size of 256, ensure a chunk or ack is written in response to processing one or more incoming chunks to help the sender detect timeouts faster
* BLE - default chunk size of 20 to fit into a BLE data frame, no acks necessary
* 802.15.4 based transports - default chunk size of 120 bytes, no acks necessary (use 802.15.4 framing acks)
* Serial - use the hardware serial buffer size (64 bytes for many arduino devices) as the chunk size, and require writing an ack for every chunk read for flow control to not overflow the hardware buffer

## Implementations

* [js](https://github.com/telehash/lob-enc/blob/master/index.js#L101)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/chunks.h)