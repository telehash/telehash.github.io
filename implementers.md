# Implementers Guide

## Discussions

Most of the developers prefer the Jabber chatroom at [theroom@conference.jabber.org](xmpp:theroom@conference.jabber.org) and many also idle in #telehash on freenode.

There isn't a mailing list, all collaboration is either via chat or GitHub.

## Contributing

To contribute to the protocol, please either file an issue or fork and create pull requests for the main [documentation repo](https://github.com/telehash/telehash.org).

To contribute to an existing [implementation](implementations.md) please use it's repo, and to start a new one please add it to that implementation list.

<a name="api" />
## API

> This section is pretty minimal and being expanded, contributions welcome

Every switch must expose an interface for application developers to access.  While this is often language-specific, there are some common patterns that have developed across most implementations:

* **generating a hashname** - given an optional list of CSIDs (see [csids](#defaults)), generate a new hashname and return the `parts` and `keys` (including the private keys)
* **switch creation/init** - given `parts` and `keys`, load the hashname and create a switch
* **add seeds** - support the [JSON](seeds.md) format to load seed information
* **start channel** - given a hashname, type, and initial JSON/BODY, initiate a channel (optional callback for responses)
* **listen for channel** - given a type and some callback/event trigger, handle new incoming channels for this type

Channel interactions may be at a pure/raw packet level, or wrappers may be provided to interact more like a stream/buffer.

There are misc APIs such as [telesocket](ext/telesocket.md) that a switch may want to support to expose simpler functionality.

<a name="defaults" />
## Default Configuration Values

There are many configurable numbers within a switch, here's the list of all of them and the current best suggested defaults and minimums/maximums:

| Name | Default | Minimum | Maximum | Notes
| ---- | ------- | ------- | ------- | -----
|`csids`|1a, 2a, 3a|||which CSIDs to use by default when generating new hashname
|`k`|8|2|100|[DHT](dht.md#k)
|`link-max`|256|8|*|[DHT](dht.md#link-max)
|`link-ping`|55|||[seconds](dht.md#maintenance)
|`link-timeout`|120|||[seconds](dht.md#maintenance)
|``||||

<a name="update" />
## v2.0 to v2.1-pre

This is a summary changes for v2 implementations when updating to v2.1-pre

* The [packet](packet.md) format added the ability to return a HEAD length of 1
* The [hashname](hashnames.md) is calculated differently now, requires a `parts` instead of a DER key
* The [network](network.md) open and line packets are all binary now
* Crypto is split into [Cipher Sets](cipher_sets.md), which changes key generation, switch initialization, and open/line handling
* The [open](network.md#open) handling of the `at` value is better defined, and opens should be cached/resent for the same line
* The v2 AES switched to [GCM](cs/2a.md).
* A [channel](channels.md) ID is now a number.
