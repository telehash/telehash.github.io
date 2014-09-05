HTTP <> Telehash Bindings - THTP
================================

This is a proposal for how to use HTTP over telehash for the common browser user-agent and web-app patterns.

## URI

The URI mapping for telehash is:

`thtp://851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6/path/resource.ext?query=arg`

It is identical to HTTP for the path and query string encoding, and instead of a hostname it is a hashname.

In browser rendering, the hashname can be shortened to "851042...27d3a6" visually. (TBD, how to show friendly nicknames for bookmarked/frequented/trusted hashnames)

The URI can also be `thtp:///path` which defaults to the current hashname in the context it is used.

## THTP Packet

Any HTTP request/response is normalized into a telehash packet by translating the headers into the JSON and any contents attached as the binary BODY.  The headers are always lower-cased keys and string values, for requests the `:method` and `:path` with string values are included, and for responses the `:status` with the numeric value is included.

The request:

```
GET / HTTP/1.1
User-Agent: curl/7.30.0
Accept: */*
```

Becomes:

```json
{
  ":method":"get",
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


## THTP Channels

A new THTP request is initiated by creating a reliable channel of type `thtp`, multiples can be created simultaneously. These channels are always in one direction, the hashname starting the channel can only send a THTP request over it, and the receiving side can only send a response.  If the receiving needs to make requests, it can start a THTP channel in the other direction at any point.

The initial channel packet includes all of or as much of the THTP request as possible in the BODY with subsequent packets if it needs to be fragmented, with the last packet always including an `"end":true` to end the channel.

```json
{
  "c":1,
  "seq":0,
  "type":"thtp",
  "end":true
}
BODY: THTP Request
```

The response is the same pattern, with the BODY being a THTP response packet continuing in subsequent packets until the `"end":true`.

```json
{
  "c":1,
  "seq":1,
  "end":true
}
BODY: THTP Response
```
