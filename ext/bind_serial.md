SERIAL <> Telehash Bindings
===========================

A serial port can be used to send raw telehash packets using the [track](enc_track.md) encoding, but it must first switch into track mode using an escape sequence of four bytes: "0x0a2a0310" which tells the other side that it would like to switch to track.  If there is no response in 1s it should switch back to a default (text) mode.  Either side may initiate this handshake upon detecting a new serial connection.

Once in track mode, the default frame size is 32 bytes and no more than one frame can be sent until a tick is received in order to not overflow serial input buffers on small devices.