Cipher Sets
===========

A Cipher Set (`CS`) is a group of crypto algrithms that are used to implement the core security functions as required by Telehash.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified with a unique identifier (`CSID`) that represents the overall selection priority. The CSID is a single byte, represented in lower case hex. The CSIDs are always sorted from lowest to highest preference.

* [CS1a](cs/1a.md) - Minimum lightweight set designed for use with embedded devices and low resource environments using ECC (160r1) and AES (128)
* [CS2a](cs/2a.md) - Original set from 2013 using RSA (2048), ECC (P-256), and AES (256)
* [CS3a](cs/3a.md) - Modern set using [NaCl](http://nacl.cr.yp.to/)

Each CS contributes two values that are used within the protocol, a `fingerprint` and a `key`.  The `fingerprint` is used to calculate the [hashname](hashnames.md) (included in its `parts`), and the `key` is the binary public key that is required in order to initiate an `open`.

Two hashnames must always initiate a `line` to each other using the highest shared CSID between them.  Apps may choose which one or more CSIDs they want to support when they create a new hashname and know that a lower one will only ever be used to communicate with hashnames that only support that CS.

Any CSID of "0*" ("01" through "0a") are reserved for special case custom Cipher Sets who's definitions are entirely app-specific, "00" is not allowed to be used at all.

> Also see the [FAQ](faq.md#cs) for common questions and [Implementers Notes](implementers.md#cs) for help when implementing a Cipher Set.
