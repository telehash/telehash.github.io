Virtual Private Networking
==========================

> TODO, document here how to use TUN/TAP interfaces, the block channel, and map hashnames to IPv4/IPv6/MAC addresses so that tools building VPNs with telehash are interoperable

## Mapping/Addressing

When exchanging hashnames over existing IPv4/IPv6 based systems, the 4 or 16 byte prefix of the 32 byte hashname binary value is used to provide a backward-compatible mechanism for addressing.  It does not guarantee uniqueness (which should be enforced outside of the IP-based systems) but for many use-cases it can be a helpful connectivity signalling tool.

When the IP space must be scoped into a reserved range and the port number is also available to use, the first 2 bytes may be sent as the port and then those 2 bytes in the address are hard-coded to a reserved IP prefix.

A hashname may also be used as a normal MAC address with the prefix of `42` (has the locally-assigned bit set) and the first 5 bytes of the hashname: `42:XX:XX:XX:XX:XX`.