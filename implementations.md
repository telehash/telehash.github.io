# Implementations

In order to use telehash in an application, the application will need to include a software layer that talks to the network, handles the encryption, and processes packets.  This software is known as a *switch* and may come in the form of a library, module, or SDK depending on your language/platform.

It is highly recommended to use an existing implementation for your environment rather than creating one from scratch. This will help ensure that the security, identity, and networking aspects are verified properly. If there isn't one which meets your needs, then please see the [Implementers Guide](implementers.md).

Please update this list through a [pull request](https://github.com/telehash/telehash.org) for any new implementations:

* Node.js - [node-telehash][]
* Javascript (generic) [thjs][]
* Objective-C - [objc][]
* C [telehash-c][]
* Java - [telehash-java][]
* Ruby - [ruby-telehash](https://github.com/telehash/ruby-telehash)
* Haskell - [htelehash](https://github.com/alanz/htelehash)
* Python - [plinth](https://github.com/telehash/plinth)
* D - [telehash.d](https://github.com/temas/telehash.d)
* Go - [gogotelehash](https://github.com/telehash/gogotelehash)
* PHP - [SwitchBox](https://github.com/jaytaph/switchbox)
* Erlang - [relish](https://github.com/telehash/relish)

## Feature Support Matrix

Any implementation not listed here is in alpha/development state, please add them to the table as soon as they support sending/receiving open and line packets.

| Feature       | [Node][] | [Browser][] | [C][] | [ObjC][] | [Java][] | Haskell     |
|---------------|:--------:|:-----------:|:-----:|:--------:|:--------:|:-----------:|
| [CS1a][]      |      yes |         yes |   yes |          |          |    yes      |
| [CS2a][]      |      yes |         yes |   yes |      yes |      yes |             |
| [CS3a][]      |      yes |             |   yes |      yes |          |             |
| [IPv4][]      |      yes |             |   yes |      yes |      yes |    yes      |
| [IPv6][]      |      yes |             |   yes |      yes |      yes |             |
| [HTTP][]      |      yes |         yes |       |          |          |             |
| [WebRTC][]    |          |         yes |       |          |          |             |
| [discovery][] |      yes |             |  some |          |          |             |
| [seek][]      |      yes |         yes |  send |      yes |     send |    send     |
| [link][]      |      yes |         yes |  send |      yes |          |    send     |
| [peer][]      |      yes |         yes |  send |          |          |    send     |
| [connect][]   |      yes |         yes |   yes |      yes |          |     yes     |
| [bridge][]    |      yes |         yes |       |          |          |             |
| [path][]      |      yes |         yes |       |      yes |          |             |
| [thtp][]      |      yes |         yes |   yes |          |          |             |
| [tsocket][]   |      yes |         yes |       |          |          |             |
| [messages][]  |      yes |         yes |       |          |          |             |
|               |          |             |       |          |          |             |


## App Developer Overview

Each switch implementation will have an [API](implementers.md#api) that varies based on it's implementation, but in general there are a few common things every application using telehash has to do:

* **seeds** - bundle a [seeds.json](seeds.md) file including public and/or dedicated seeds for your app to bootstrap from
* **hashname creation** - upon first startup the app will have to create a unique local hashname for that instance and save it out
* **switch startup** - for a normal startup, initialize a switch with a created/saved hashname and list of seeds
* **listen for incoming channels** - any hashname can receive a channel request anytime, most switches provide some kind of callback/event mechanism to be triggered when a new channel is started
* **start a new outgoing channel** - every switch should enable an app to start a new channel to another hashname and send/receive packets over it

[node]: https://github.com/telehash/node-telehash
[node-telehash]: https://github.com/telehash/node-telehash
[thjs]: http://github.com/telehash/thjs
[browser]: http://github.com/telehash/thjs
[objc]: https://github.com/telehash/objc
[c]: https://github.com/telehash/telehash-c
[telehash-c]: https://github.com/telehash/telehash-c
[java]: https://github.com/telehash/telehash-java
[telehash-java]: https://github.com/telehash/telehash-java
[cs1a]: cs/1a.md
[cs2a]: cs/2a.md
[cs3a]: cs/3a.md
[ipv4]: network.md
[ipv6]: network.md
[http]: ext/path_http.md
[webrtc]: ext/path_webrtc.md
[discovery]: ext/discovery.md
[seek]: switch.md#seek
[link]: switch.md#link
[peer]: switch.md#peer
[connect]: switch.md#connect
[bridge]: switch.md#bridge
[path]: switch.md#path
[thtp]: ext/thtp.md
[tsocket]: ext/telesocket.md
[messages]: ext/messages.md

