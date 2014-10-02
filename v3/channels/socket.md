# `sock` - Tunneled TCP/UDP Sockets

A channel of `"type":"sock"` is a request to create a minimal tunneled TCP or UDP socket, carrying arbitrary binary data.  It may be reliable for TCP, or unreliable to carry UDP.  It is designed to mirror the popular socket interfaces for the most common usage patterns, but not as an exhaustive or complete replacement.

The open packet must contain a `"sock":value` where the value is one of `connect`, `bind`, or `accept`, and usually has a `"src":{"ip":"1.2.3.4","port":5678}` and/or `dst` specified. An open may also contain the initial binary `BODY` payload to deliver if successful.

## `connect`

Request to create a new socket to the given `dst`.  Any non-error packet response indicates the connection was opened. It may have an optional `"src":{...}` indicating the known original source ip/port when proxying/tunneling.

## `bind`

Request for the recipient to create a listening socket and bind to it.  If the `src` is included, only the `port` should be specified in it (and defaults to `0` if not) to indicate that the recipient chooses any open port to listen on.  The response must include a `dst` that specifies the current `ip` and `port` bound to this channel that the recipient may use/distribute.  The recipient should do whatever is necessary to ensure they are public usable addresses.

For an unreliable bind, sending and receiving UDP messages happens on the same channel using a `src` and `dst` address.  The sender specifies a `dst` to originate a new UDP message from the port, and receives incoming messages with a `src` indiciating where they came from.

For a reliable bind, incoming connections will individually open new `accept` channels from the recipient for each one.

## `accept`

When the recipient has an active reliable `bind`, any new incoming connection will generate an accept channel and must have the `dst` of the originating bind along with the `src` address information.