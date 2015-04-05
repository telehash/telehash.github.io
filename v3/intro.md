tele·hash
> n. *Internet*, from **tele**graph and **hash**table

# Introduction

Telehash is a 100% open, secure mesh networking standard with the following design goals:

* full end-to-end encryption, all the time
* strict privacy: no content, identity, or metadata is ever revealed to 3rd parties
* maximum app/device compatibility: suitable for embedded, mobile, and web usage
* flexible transport protocols, for compatibility with existing layers
* making privacy an *easy* choice for developers
* native implementations for the widest possible variety of languages/platforms

The telehash team includes collaborators from around the world, many of whom were the principle architects of [XMPP](http://en.wikipedia.org/wiki/XMPP). It is intended as a next-generation protocol advancing the original goals of Jabber.

![Basic Network](v3/BasicNetwork.png)

The primary architecture contains application or device instance endpoints that each maintain a [mesh](mesh.md) of secure [links](link.md) to other endpoints.  A mesh is private to each instance, one endpoint may have different links than another.

The current v3 has these high-level properties:

* each endpoint has verifiable unique fingerprint (a [hashname](hashname.md)), a secure universal MAC address
* provides native tunneling of TCP/UDP sockets, HTTP, object streams, and more
* facilitates asynchronous and synchronous messaging and eventing
* supports an automatic peer discovery mode when available on local transports
* specifies a [URI](uri.md) format for initiating new links out-of-band
* supports bridging and routing privately by default and optionally via a [public DHT (draft)](https://github.com/telehash/blockname)
* integrates native support for [JSON Object Signing and Encryption (JOSE)](https://datatracker.ietf.org/wg/jose/charter/) and [OpenID Connect](http://openid.net/connect/)

![Telehash Stack](v3/THStack.png)

The protocol stack is separated into two main areas, a lower level [end-to-end encrypted exchange (E3X)](e3x/intro.md) that handles all of the security primitives and encrypted [messages](e3x/messages.md), and higher application-level definitions for managing a [mesh](mesh.md) of [links](link.md) that support standard [channels](channels/), [transports](transports/), and [URIs](uri.md).

## Design Philosophy

The principle idea that drove the creation and development of telehash
is the belief that any application instance should be able to easily and
securely talk to any other application instance or device, whether they are two
instances of the same application, or completely different
applications. They should be able to do so directly, and in any
environment, from servers to mobile devices down to embedded systems
and sensors.

By enabling this freedom for developers as a foundation for their
applications, telehash enables the same freedom for the people using
them - that the user can connect, share, and communicate more easily
and with control of their privacy.

The challenges and complexity today in connecting applications via
existing technologies such as APIs, OAuth, and REST is only increasing,
often forcing fundamentally insecure, centralized, and closed/gated
communication platforms.  By adopting telehash in any application, that
application immediately has a powerful set of open tools for not only
its own needs, but can then also enable connectivity to and from
applications created by others easily. These tools include the ability
to have friends, sharing, feeds, tagging, search, notifications,
discovery, transactions, and other social patterns.

Telehash has a fundamental requirement to remain simple and
light-weight in order to support applications running on networked
devices and sensors. The design goals also include not forcing any
specific architectural pattern such as client-server,
centralized/federated/distributed, polling/push, REST, streaming,
publish-subscribe, or message passing... any can be used, as telehash
simply facilitates secure reliable connectivity between any two or more
applications in any networking environment.

<a name="usage" />
## Usage

The word _telehash_ should be pronounced as the root terms would normally be pronounced in the speaker's native dialect.

It is usually written in all lower-case in the sense of a modern version of the word "telephone", both as a generic private communication system that is federated and compatible, and the act of two application instances communicating privately and directly.

<a name="logo" />
## Logo

![logo-128](logo/mesh-logo-128.png)

The telehash [logo](https://github.com/telehash/telehash.org/tree/master/v3/logo) was designed and contributed by [Jake Ingman](https://github.com/jingman) and is freely available for apps to use in representing support and current mesh connectivity status.

The official color is [#2a7e60](http://www.color-hex.com/color/2a7e60).

## Change Log

### v1

The name and first version of the protocol was established in [2009](https://github.com/quartzjer/Telehash) by [Jeremie Miller](http://en.wikipedia.org/wiki/Jeremie_Miller) and was primarily a DHT-P2P [research project](http://quartzjer.tumblr.com/post/71784515314/telehash-history).

### v2

In 2013 it was significantly updated with a privacy focus as [v2](https://github.com/telehash/telehash.org/tree/master/v2).

### v3

In 2014 the protocol refactored the wire encryption into [E3X](e3x/intro.md) and moved the DHT functionality into a separate project called [blockname](https://github.com/telehash/blockname).

* [v3.0.0-rc1](spec/v3.0.0-rc1.pdf) released on 2015-04-04
