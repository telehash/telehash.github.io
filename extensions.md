Extensions
==========

Extensions are used to adapt the core protocol to a multitude of different needs and experiment with new patterns atop telehash. This is the place for application developers to look through to see if there are any existing solutions that closely match their needs. Sometimes these extensions are supported by an [implementation](implementations.md) or a module for one, and sometimes they are just definitions of best practices for an application.

This is also where any switch [implementers](implementers.md) use as a reference to add new features and support for additional network transports.

There are four primary categories of extensions:

* **[Channels](#channels)** - Any use of common channel types or patterns of how to use a channel
* **[Networks](#networks)** - Definitions of how to use the protocol on different network transports
* **[Bindings](#bindings)** - Mappings of existing common protocols onto telehash
* **[Core](#core)** - These are proposals and ideas around extending the core protocol

<a name="channels" />
# Channels

* **[Bridge](ext/bridge.md)** - Any use of common channel types or patterns of how to use a channel
* **[](ext/.md)** - 
* **[](ext/.md)** - 
* **[](ext/.md)** - 

<a name="networks" />
# Networks

* **[](ext/.md)** - 
* **[](ext/.md)** - 
* **[](ext/.md)** - 
* **[](ext/.md)** - 
* **[](ext/.md)** - 
* **[](ext/.md)** - 

<a name="bindings" />
# Bindings

* **[XMPP](ext/bind_xmpp.md)** - How XMPP clients can use telehash for direct messaging and media with end-to-end encryption
* **[HTTP](ext/bind_http.md)** - Running HTTP over telehash
* **[NTP](ext/bind_ntp.md)** - Using NTP for time sync between hashnames
* **[IP](ext/bind_ip.md)** - Tunneling IP traffic over telehash

<a name="core" />
# Core

* **[ORT](ext/ort.md)** - Opaque Routing Tree, ability to connect w/o knowing source/destination network addresses
* **[Shaping](ext/shaping.md)** - Packet shaping to obscure size or timing based traffic analysis
* **[Mesh](ext/mesh.md)** - How to add support for local mesh routing/discovery decisions (sensor networks, neighborhood wireless, etc)
