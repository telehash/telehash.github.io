UDP Transport
=============

Direct mapping, one packet to one message, always [cloaked](../e3x/cloaking.md).

Packets larger than the MTU may be fragmented by the router, but [chunking](../lob/chunking.md) should not be used for UDP messages, packets larger than a low MTU should be dropped so that higher level implementations can optimize the packet sizes and detect the MTU.