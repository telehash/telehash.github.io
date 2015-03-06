# `block` - Lossy Block Transfer

> [DRAFT](https://github.com/telehash/telehash.org/labels/draft)

For transferring lossy data with block sizes larger than the default packet MTU (1400), such as [802.3 Ethernet Frames](http://en.wikipedia.org/wiki/Ethernet_frame).

The `"type":"block"` channel is unidirectional, blocks only flow in one direction, and multiple block channels may be open in either direction.

The channel open request must not contain any block data and may contain an attached packet to specify the purpose of the block channel request (like `link` channels). A block channel may be opened in response to an external request and the sender may begin sending block packets immediately following the open, or may wait for an answer before sending.

### Sending a Block

Every block sent on the channel is assigned a sequential positive integer id starting from 1 as the value of `"b":1`, every packet after the open is required to have a `b` value. The block bytes are attached as the raw `BODY`.

Any packet received with an older `b` is ignored/dropped.

The offset position of the attached bytes in the larger block is set as `"at":1000` and defaults to `0`.  The last packet for a block must contain a `"done":true`, and if there are any missing bytes in the block, the whole block is dropped.

To send a short block that fits in one packet it's just:

```json
{
  "c":1,
  "b":1,
  "done":true
}
BODY: bytes
```

To break a 1841 byte block into parts it's:

```json
{
  "c":1,
  "b":2
}
BODY: bytes 0 to 1000

{
  "c":1,
  "b":2,
  "at":1000,
  "done":true
}
BODY: bytes 1001 to 1841
```