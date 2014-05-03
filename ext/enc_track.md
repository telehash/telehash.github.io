Track Encoding
==============

This is a minimalist byte-encoding technique to serialize packets over alternative data transports, simply a way to break any one or more packets into small parts and re-assemble them with requiring a state machine.

It contains no CRC or other consistency checks as it is only designed to carry the encrypted open and line packets which have their own internal validation.

## Format

A packet is broken into frames of size 1 to 256 bytes each, and each frame is prefixed with the single byte representing it's length.  The packet is ended with a frame of zero lenth, or one null byte, also called a `tick`.

The maximum size of the frames is determined by the underlying transport maximum buffer size, allowing each frame to fit within the transmission/confirmation buffer.

For example (in hex):

```
ORIGINAL (47 bytes): 0000cf98aea22264ec0f7db804305dcd365d418805dc44c485493f83b36a23d7eec3b599ded63ba59b23c2d0c51ff7

64-byte FRAMES:
(49 bytes): 2f0000cf98aea22264ec0f7db804305dcd365d418805dc44c485493f83b36a23d7eec3b599ded63ba59b23c2d0c51ff700

32-byte FRAMES:
(32 bytes): 200000cf98aea22264ec0f7db804305dcd365d418805dc44c485493f83b36a23
(18 bytes): 10d7eec3b599ded63ba59b23c2d0c51ff700

```

If there were multiple packets waiting to be sent, every frame with more than two bytes of extra capacity left at the end of one packet is filled with the beginning of the next.  So in the example above if the same original packet was sent twice in a row with 32-byte frames, the last one would be `10d7eec3b599ded63ba59b23c2d0c51ff7000d0000cf98aea22264ec0f7db804` filling 13 bytes of the next packet.

All bytes received should be appended to a buffer until the terminating zero frame, at which point the buffer should be checked for a valid packet or discarded.  The underlying transport semantics should specify a small timeout to receive a complete buffer in the case of lost frames.

Some transports may send ticks (empty frame null bytes) as acknowledements of received frames so that the sender can continue.

## Transports

| Transport     | Frame Size   | Reset Timeout |
| ------------- | ------------:| -------------:|
| Bluetooth LE  |           20 |  configurable |
| 802.15.4      |          127 |          20ms |
| Serial        |           32 |          30ms |
| TCP           |          256 |           N/A |
