tele·hash
> n. *Internet*, from **tele**graph and **hash**table

# Introduction

Telehash is a completely open secure mesh networking standard with the following principles:

* 100% end-to-end encrypted at all times
* strict privacy, no content, identity, or metadata is ever revealed to 3rd parties
* capable of using different transport protocols, app or network layer
* designed to complement and add to existing transport security
* easy to use for developers to encourage wider adoption of privacy
* native implementations to each language/platform
* designed for compatibility between embedded device, mobile, and web usage

The current v3 has these properties:

* each endpoint has verifiable unique fingerprint (a [hashname](hashname.md)), a secure global MAC address
* a consistent high level [mesh](mesh.md) interface that maintains one or more [links](link.md) to other endpoints
* supports an automatic peer discovery mode when available on local transports
* provides native tunneling of TCP/UDP sockets, HTTP, object streams, and more
* facilitates asynchronous and synchronous messaging and eventing
* supports bridging and routing privately by default and optionally via a [public DHT (draft)](https://github.com/telehash/blockname)
* integrates native support for [JSON Object Signing and Encryption (JOSE)](https://datatracker.ietf.org/wg/jose/charter/) and [OpenID Connect](http://openid.net/connect/)

The protocol stack is separated into two main areas, a lower level [end-to-end encrypted exchange (E3X)](e3x/) that handles all of the security primitives, and higher application-level definitions for managing a [mesh](mesh.md) of [links](link.md) that support standard [channels](channels/), [transports](transports/), and [URIs](uri.md).

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
discovery, and other social patterns.

Telehash has a fundamental requirement to remain simple and
light-weight in order to support applications running on networked
devices and sensors. The design goals also include not forcing any
particular architectural design such as client-server,
centralized/federated/distributed, polling/push, REST, streaming,
publish-subscribe, or message passing... any can be used, as telehash
simply facilitates secure reliable connectivity between any two or more
applications in any networking environment.

<a name="usage" />
## Usage

The word telehash should be pronounced as the root terms would normally be pronounced in the speaker's native dialect.

It is usually written in all lower-case in the sense of a modern version of the word "telephone", both as a generic private communication system that is federated and compatible, and the act of two application instances communicating privately and directly.

<a name="logo" />
## Logo

The telehash "mesh" [logo](https://github.com/telehash/telehash.org/tree/master/v3/logo) was designed and contributed by [Jake Ingman](https://github.com/jingman) and is openly available for apps to use in representing support and current mesh connectivity status.

The official color is [#2a7e60](http://www.color-hex.com/color/2a7e60).

## History

The name and first version of the protocol was established in [2009](https://github.com/quartzjer/Telehash) by [Jeremie Miller](http://en.wikipedia.org/wiki/Jeremie_Miller) and was a research project until [2013 (v2)](https://github.com/telehash/telehash.org/tree/master/v2) when it was significantly updated with a privacy focus.

In [2014 (v3)](https://github.com/telehash/telehash.org/tree/master/v3) the protocol was refactored into [e3x](https://github.com/telehash/telehash.org/tree/master/v3/e3x), [mesh](https://github.com/telehash/telehash.org/blob/master/v3/mesh.md), and [blockname](https://github.com/telehash/blockname), to focus on being a set of easy to use end-to-end encrypted mesh communication tools.

See this [blog post](http://quartzjer.tumblr.com/post/71784515314/telehash-history) for some more history on its development.
