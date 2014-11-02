Chunking
========

For sending packets over transports that require additional framing (such as TCP/TLS), small MTU (such as Bluetooth LE and 802.15.4), or flow control (Serial), this is a minimalist byte-encoding technique to encourage interoperability. It is simply a way to break any one or more packets into small chunks and re-assemble them with minimum overhead.

It contains no CRC or other consistency checks as it is only designed to carry encrypted packets with their own internal validation.

## Format

A packet is broken into chunks of size 0 to 256 bytes each and each chunk is prefixed with the single byte representing it's length,  then the sequence of one or more chunks is terminated with a zero-length chunk (a single null byte). Sequential chunks received that have any size should be appended to a buffer until the zero chunk, at which point the buffer should be checked for a valid packet or discarded.

At any point a zero-length chunk may be sent ad-hoc and used by a transport for chunk acknowedgement or keepalive signals when necessary.

## Transport Notes

* TCP / TLS - basic chunking
* BLE - one required ack per chunk, each chunk must be fragmented into 20 byte to fit the frame size
* Serial - if necessary/limited by a hardware serial buffer on a device, one ack per buffer size to control flow
* 802.15.4 - one required ack per packet, chunks will be fragmented into 127 byte sizes per transmit size
