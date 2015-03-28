E3X - End-to-End Encrypted eXchange
===================================

See the [intro](intro.md) for more background and an overview.

## Index

* [packet](../lob.md) - all binary and JSON data encoding/encapsulation
* [Cipher Sets](cs/) - asynchronous and streaming encryption, multiple keys
* [message](messages.md) - an asynchronous encrypted packet between two endpoints
* [handshake](handshake.md) - a type of message used to establish a streaming encryption session for channels
* [channel](channels.md) - small (max 1400 bytes) synchronous encrypted packets, proxies larger reliable and unreliable data streams
* [cloaking](cloaking.md) - randomize all bytes on the wire

## Implementations

* [JavaScript](https://github.com/telehash/e3x-js)
* [C](https://github.com/telehash/telehash-c/blob/master/src/e3x.h)
* [Go](https://github.com/telehash/gogotelehash/tree/master/e3x)
* [C#](https://github.com/telehash/telehash.net/tree/master/Telehash.Net/E3X)


|              | base | reliable | cloaking | 1a | 1b | 1c | 2a | 2b | 3a |
|:------------:|:----:|:--------:|:--------:|:--:|:--:|:--:|:--:|:--:|:--:|
|    node.js   |   ✓  |     ✓    |     ✓    |  ✓ |    |    | ✓ |    | ✓ |
| browser js   |   ✓  |     ✓    |     ✓    |  ✓ |    |    | ✓ |    |   |
|   c - unix   |   ✓  |    ✓    |     ✓    |  ✓ |    |    | ✓ |    | ✓ |
| c - embedded |   ✓  |    ✓    |     ✓    |  ✓ |    |    |    |    |    |
|      go      |   ✓  |     ✓    |          |  ✓ |    |    |    |    |    |
|      c#      |   ✓  |         |          |  ✓ |    |    | ✓ |    |    |

