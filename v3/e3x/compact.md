# Compact Channel Headers

* set `"c":1` in handshake to signal CBOR headers (`0` is default, regular LOB with JSON)
* after decryption it is decoded as CBOR instead of LOB
* first value is always channel id (unsigned int)
* optional text value is the "type"
* optional unsigned int is a seq
* optional array is ack+miss (ack is always the first value)
* optional byte string is the payload LOB packet

JSON channel header (46 bytes):

`{"c":1,"type":"type","seq":2,"ack":22,"miss":[1,2,20]}`


[CBOR diagnostic](http://cbor.me/?diag={0:1,1:%22type%22,8:22,9:[1,2,20]}) (wrapped in map for the tool):

`1, "type", 22, [22,1,2,20]`

CBOR binary (11 bytes):

```
   01          # unsigned(1)
   64          # text(4)
      74797065 # "type"
   16          # unsigned(22)
   83          # array(3)
      01       # unsigned(1)
      02       # unsigned(2)
      14       # unsigned(20)
```