Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by e3x.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The `CSID` is a single byte, represented in lower case hex. The CSIDs are always sorted from lowest to highest preference.

* [CS1a](cs/1a.md) - (legacy) Minimum lightweight set designed for use with embedded devices and low resource environments using ECC (160r1) and AES (128)
* [CS2a](cs/2a.md) - (legacy) Original set circa 2013 using RSA (2048), ECC (P-256), and AES (256)
* [CS3a](cs/3a.md) - (preferred) Modern set using [NaCl](http://nacl.cr.yp.to/)


Two endpoints must always create exchanges to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Any `CSID` of "0*" ("01" through "0a") are reserved for special use custom Cipher Sets whose definitions are entirely app-specific, the "00" `CSID` is not allowed and always considered invalid.

## Exchanging CS Keys

Cipher Sets are designed to work well with [hashnames](../../hashname/), which use [BASE32](http://tools.ietf.org/html/rfc4648) encoding to create strings that are safe to use everywhere.

One or more Cipher Set Keys can be encoded in JSON using the same BASE32 encoding and the CSID as the key.

<a name="json" />
### Full JSON

The source keys to calculate a hashname may be exchanged and represented as a complete JSON object where the ID is in HEX and the public key is BASE32 encoded:

```json
{
  "3a":"tydfjkhd5vzt006t4nz5g5ztxmukk35whtr661ty3r8x80y46rv0",
  "2a": "621028hg1m30jam6923fe381040ga003g80gy01gg80gm0m2040g1c7bn5rdbmctf9qf56xvjf7d0faygd350fgpwy9baqg9e6ffhmmd2z0dytj6m6yn4cud1ny2nbv4qt7mn0fcper50zv4g1kavyv7mxm4tc06xhq33n8mzn80c6y6knyntvxfcnh1k9aftvrrb43b3vrh7eed3h117z4rqcruj3c38nyj6mdaudgdz6eph2wb2zzjf9h1c0tz9np4nbpvj42m5k192gqb36cgzvhchmzr3d4xutv3knw31h9g28bfbaawdexzrtc1cjdpx7yz6x9v2wjjhhettq1ehm457vf1r1kuqmynyvfkr5hhv3vf3dmwqxh03kruk0y2zve3h39a9d748raemkjg02avxcm3ktrd1jaxnbcup69m1u0e9kuq3mffj0g0cq3rqyjqyr2491820c0g008",
  "1a": "8jze4merv08q6med3u21y460fjdcphkyuc858538mh48zu8az39t1vxdg9tadzun"
}
```

<a name="compact" />
### Compact Intermediate JSON

Frequently the source for a hashname is being sent in a context where there is a specific `ID` already known or agreed upon and only that key needs to be exchanged.  This can be more efficiently encoded with JSON that only includes the `intermediate hash` values (in BASE32) of the other IDs so that the correct hashname can be calculated.  Here's an example [packet encoding](../lob/) that includes the known ID key value as the BODY and the remaining intermediate hash values in the JSON:

```
HEAD:
{
  "3a": "gmamb66xcujtuzu9cm3ea9jjwxeyn2c0r8a4bz8y7b7n408bz630",
  "1a": "5vt3teqvjettaxkzkh47a7ta48e3hgp3bruern92xgh89am04h4g"
}
BODY: [2a's public key bytes]
```

The full and compact JSON formats use the same ID-as-name in order to ensure that they are only used in the correct contexts, they are never interchangable.