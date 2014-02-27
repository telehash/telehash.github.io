# Implementations

In order to use telehash in an application, the application will need to include a software layer that talks to the network, handles the encryption, and processes packets.  This software is known as a *switch* and may come in the form of a library, module, or SDK depending on your language/platform.

It is highly recommended to use an existing implementation for your environment rather than creating one from scratch. This will help ensure that the security, identity, and networking aspects are verified properly. If there isn't one which meets your needs, then please see the [Implementers Guide](implementers.md).

Please update this list through a [pull request](https://github.com/telehash/telehash.org) for any new implementations:

* Node.js - [node-telehash](https://github.com/telehash/node-telehash)
* D - [telehash.d](https://github.com/temas/telehash.d)
* Python - [plinth](https://github.com/telehash/plinth)
* Javascript (browser) [thjs](http://github.com/telehash/thjs)
* C [telehash-c](http://github.com/quartzjer/telehash-c)
* Ruby - [ruby-telehash](https://github.com/telehash/ruby-telehash)
* Go - [gogotelehash](https://github.com/telehash/gogotelehash)
* Java - [telehash-java](https://github.com/simmons/telehash-java-simmons)
* ObjectiveC - [telehash-objc](https://github.com/telehash/objc)
* PHP - [SwitchBox](https://github.com/jaytaph/switchbox)
* Erlang - [relish](https://github.com/telehash/relish)

## App Developer Overview

Each switch implementation will have an [API](implementers.md#api) that varies based on it's implementation, but in general there are a few common things every application using telehash has to do:

* **seeds** - bundle a [seeds.json](seeds.md) file including public and/or dedicated seeds for your app to bootstrap from
* **hashname creation** - upon first startup the app will have to create a unique local hashname for that instance and save it out
* **switch startup** - for a normal startup, initialize a switch with a created/saved hashname and list of seeds
* **listen for incoming channels** - any hashname can receive a channel request anytime, most switches provide some kind of callback/event mechanism to be triggered when a new channel is started
* **start a new outgoing channel** - every switch should enable an app to start a new channel to another hashname and send/receive packets over it

