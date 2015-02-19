HTTP <> Telehash Bindings - thtp
================================

This is a channel mapping HTTP to telehash for the common browser user-agent and web-app patterns.  Most HTTP requests can be translated directly into a `thtp` channel and back.


## Packet

Any HTTP request/response is normalized into a packet by translating the headers into the JSON and any contents attached as the binary BODY.  The headers are always lower-cased keys and string values, for requests the `:method` (upper case) and `:path` with string values are included, and for responses the `:status` with the numeric value and optional `:reason` string value are included.

The request:

```
GET / HTTP/1.1
User-Agent: curl/7.30.0
Accept: */*
```

Becomes:

```json
{
  ":method":"GET",
  ":path":"/",
  "user-agent":"curl/7.30.0",
  "accept":"*/*",
}
```
```
BODY: empty
```

The response:

```
HTTP/1.1 301 Moved Permanently
Server: nginx
Date: Fri, 07 Mar 2014 21:33:14 GMT
Content-Type: text/html
Content-Length: 178
Connection: keep-alive
Location: http://www.fooooo.com/

<html>
<head><title>301 Moved Permanently</title></head>
<body bgcolor="white">
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

Becomes:

```json
{
  ":status":301,
  ":reason":"Moved Permanently",
  "server":"nginx",
  "date":"Fri, 07 Mar 2014 21:12:39 GMT",
  "content-type":"text/html",
  "content-length":"178",
  "location":"http://www.fooooo.com/"
}
```
```
BODY:
<html>
<head><title>301 Moved Permanently</title></head>
<body bgcolor="white">
<center><h1>301 Moved Permanently</h1></center>
<hr><center>nginx</center>
</body>
</html>
```


## `thtp` channel

A new request is initiated by creating a reliable channel of type `thtp`, multiples can be created simultaneously. These channels are always in one direction, the endpoint starting the channel can only send a request packet over it, and the receiving side can only send a response packet.  If the receiving needs to make requests, it can start a `thtp` channel in the other direction at any point.

The channel open packet includes all of or as much of the request packet as possible in the BODY, with subsequent packets if it needs to be fragmented and the last packet always including an `"end":true` to end the channel.

The channel is also compatible with [streams](stream.md) such that an implementation can share the same underlying channel handler/streaming logic.

```json
{
  "c":1,
  "seq":0,
  "type":"thtp",
  "end":true
}
BODY: request packet
```

The response is the same pattern, with the BODY being a response packet, continuing in subsequent packets if necessary until the `"end":true`.

```json
{
  "c":1,
  "seq":1,
  "end":true
}
BODY: response packet
```
