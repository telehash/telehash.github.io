Cipher Sets
===========

A Cipher Set is a group of crypto algrithms that are used to implement the core security functions as required by Telehash.  Multiple sets exist to allow an evolution of supporting newer techniques as well as adapting to different system and deployment requirements.

Each set is identified here with a unique identifier that represents the overall selection priority, a larger number is always preferred when selecting which set to use when multiple matches exist between any two nodes.

* `0` - Minimum lightweight set for use primarily with embedded devices
* `1` - Historical set from telehash development in 2013 using RSA (2048), ECC (P-256), and AES (256)
* `2` - Newer set based on NaCl

(in progress...)