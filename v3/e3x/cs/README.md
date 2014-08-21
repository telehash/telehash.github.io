Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by e3x.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The `CSID` is a single byte, represented in lower case hex. The CSIDs are always sorted from lowest to highest preference.

* [CS1a](cs/1a.md) - (legacy) Minimum lightweight set designed for use with embedded devices and low resource environments using ECC (160r1) and AES (128)
* [CS2a](cs/2a.md) - (legacy) Original set circa 2013 using RSA (2048), ECC (P-256), and AES (256)
* [CS3a](cs/3a.md) - (preferred) Modern set using [NaCl](http://nacl.cr.yp.to/)


Two endpoints must always create exchanges to each other using the highest common `CSID` between them.  Apps may choose which one or more `CSIDs` they want to support when they create an endpoint and know that a lower one will only ever be used to communicate with other endpoints that only support that `CS`.

Any `CSID` of "0*" ("01" through "0a") are reserved for special use custom Cipher Sets whose definitions are entirely app-specific, the "00" `CSID` is not allowed and always considered invalid.
