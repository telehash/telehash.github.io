Track Encoding
==============

This is a minimalist byte-encoding technique to serialize packets over alternative data transports, simply a way to break any one or more packets into small parts and re-assemble them with requiring a state machine.

It contains no CRC or other consistency checks as it is only designed to carry the encrypted open and line packets which have their own internal validation.

## Format

A packet is broken into chunks of size 0 to 256 bytes each, and each chunk is prefixed with the single byte representing it's length. The packet is complete with any chunk that is less than 256 bytes, including a zero-length chunk (a single null byte).

Chunks themselves may be fragmented by the underlying transport that has a smaller MTU, and the transport may require per-fragment acknowledgements or send zero-length chunks to signal receipt of individual fragments.  Chunks and fragments are independent, so one fragment may contain the final bytes for the current chunk and the beginning bytes for the next chunk.

All bytes received should be appended to a buffer until all of the bytes have been received for the a chunk of less than 256 bytes, at which point the buffer should be checked for a valid packet or discarded.  The underlying transport semantics should specify a small timeout to receive a complete buffer in the case of lost chunks or fragments.

## Transports

| Transport     | Fragment Size | Reset Timeout |
| ------------- | -------------:| -------------:|
| Bluetooth LE  |            20 |  configurable |
| 802.15.4      |           127 |          20ms |
| Serial        |            32 |          30ms |
| TCP           |           N/A |           N/A |

## API

> this is just a draft/notes area

```
setFrag(1 to 256) to force fragmentation
inByte
inBlock(char,len)
inFrag - returns true/false if fragment has been received, resets when called
inPacket - returns next packet in buffer, if any

outByte
outBlock(buf, size) copies any in out buffer and advances up to size, depends on frag mode too
outFrag - if bytes waiting in out buffer do nothing, else add next fragment bytes to outgoing buffer, or add empty chunk (null)
outPacket

Serial
If inFrag, call outFrag
```