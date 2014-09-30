# TCP Path as a UDP alternative 

There are times when only a TCP socket to another hashname is available/usable, and like the HTTP path, this is primarily useful with the connected hashname supports bridging so that it can access the rest of the network.

The primary use case for this currently is to support Apple iOS socket "background mode" that is supported for VoIP apps, such that only a single TCP socket can be used for signalling notifications of incoming events to the app.

## Wire Encoding

Since the native telehash packet format doesn't contain knowledge of the total packet size, a minimal wrapper is needed for encoding native packets onto a TCP socket.

Every telehash packet is prefixed with two bytes that are a network order short integer representing the length of the telehash packet to read.  Once that length is read, the packet can be processed and another should be expected.

## App Usage

While a TCP path to any hashname along with bridging can be used as a gateway to the full network, the common case of acting as an idle notification trigger for an app requires two steps.  First it opens a TCP path to a given hashname and validates it with a `path` request, and then it can give that hashname to one or more app instances as the value that will be the notifier proxy.  Optionally when possible and a line has been created to the other app instances, a `bridge` can be created for those line values as well.

The other app instances when they need to send an important notification and the normal paths to the hashname are not available, they can connect to the special notifier hashname that the recipient should still have a TCP path open to and either send a `peer` request to create a new line if they don't have one yet, or simply send it the line packets for the target hashname if so (since a bridge should have been created).