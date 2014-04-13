# 802.15.4 - TMesh

> This document is only a stub, please use the [GitHub issue](https://github.com/telehash/telehash.org/issues/29) for discussion.

There is an effort just beginning to have Telehash operate as a native mesh network protocol above [802.15.4](http://en.wikipedia.org/wiki/IEEE_802.15.4). The goal is for it to follow the same seed, discovery, and low-power link maintenance for local-scale DHT operations.

Any device supporting this transport where there is a seed on the network that can bridge to any other network transport (including Wifi (UDP), Bluetooth, etc) will be able to securely connect with any other hashname.

Due to the frame size limitations, any packet may be fragmented when relayed over TMesh.  Since frames have a fixed max size, packets larger than the frame are broken into fragments with each fragment being prefixed with the size of the total packet in the same format, two-byte short length.  All frames naturally arrive in order and fragment packets with matching lengths are appended until it reaches the given size, at which time it's processed as a full packet again.