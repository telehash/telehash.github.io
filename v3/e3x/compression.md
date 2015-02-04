# Channel Payload Compression

Since channel packets are the most frequent and have a set of fixed well-known key/values in their JSON headers, both endpoints may support optional channel compression encoding to minimize the resources required.

This is important in embedded/device networks where the MTU is small (BLE and 6lowpan), and may improve performance in other edge cases with frequent small packets.

## `z` Handshake Signalling

To indicate support of a channel payload compression any endpoint may include a `z` key with an unsigned integer value in the handshake.  The value `0` is the default and signals no support.

The `z` value indicates how to decode/interpret the channel payload bytes immediately after decryption.  After any alternative processing the resulting value must still always be identical to a LOB packet with a JSON header and binary BODY, it is only to minimize encoding and not for use to include additional data in a payload.

Both endpoints must include identical `z` in a confirmed handshake in order for it to be enabled on any channel packets using the resulting keys, and only that type of channel payload is supported when enabled. There is no negotiation or signalling of support for multiple values, future `z` values will be defined that combine multiple techniques when necessary.

## `0` LOB encoded (default)

All channel payload bytes are [LOB encoded](../lob).

## `1` CBOR encoded

The value `1` signals support of [CBOR based](http://cbor.io) payloads, the bytes are interpreted as a stream of CBOR values instead of LOB encoding.

* first value is always channel id ("c", unsigned int)
* [optional] byte string of a payload LOB packet
* [optional] map of additional key/value pairs
* [optional] text value is the "type" string value
* [optional] unsigned int is a "seq" value
* [optional] array is the "ack" and "miss" unsigned int values, ack is always the first value in the CBOR array

### Decoding

When processing CBOR the result is always a regular LOB packet with a JSON header.

1. decode the channel id
2. if a byte string follows it is processed as the source LOB, if not then generate a blank/empty LOB packet
3. set the `"c":id` in the packet JSON to the channel id from 1.
4. if a map follows, it's key/value pairs must be processed and only text keys and text or number values are used, each one being set in the packet JSON
5. if a text value follows, it is set as the `"type":value` in the JSON
6. if an unsigned int follows, it is set as the `"seq":value` in the JSON
7. if an array follows, it must be processed and only unsigned int values are used, the first one is always set as the `"ack":value` and all other entries in the array are the `"miss":[1,2,3]` in the JSON.

### Examples

JSON `{"c":1,"type":"open"}` (21) [CBOR](http://cbor.me/?diag=[1,%22open%22]) (6):
```
01          # unsigned(1) // c
64          # text(4)     // type
   6f70656e # "open"
```

JSON `{"c":2,"seq":22,"ack":20,"miss":[1,2,20]}` (41) [CBOR](http://cbor.me/?diag=[2,22,[20,1,2,20]]) (7):
```
02    # unsigned(2)  // c
16    # unsigned(22) // seq
84    # array(4)
   14 # unsigned(20) // ack
   01 # unsigned(1)
   02 # unsigned(2)
   14 # unsigned(20)
```

## `2` DEFLATE encoded

All channel payload bytes are encoded/decoded with [DEFLATE](http://tools.ietf.org/html/rfc1951) before/after encryption.  The uncompressed bytes are always a normal LOB packet.

