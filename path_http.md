# HTTP Network Paths

When IPv4 and IPv6 are not available, switches may support a fallback `HTTP` path.  This is primarily useful when telehash is running inside a browser, or when an app needs to operate inside a highly restricted network that offers only HTTP.

This path is implemented using [socket.io](http://socket.io), and the only information needed to be exchanged in an `alts` is a `{"http":"http://1.2.3.4:5678/"}`.

The `socket.io` eventing interface is TBD.