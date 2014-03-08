HTTP <> Telehash Bindings - THTP
================================

This is a proposal for how to use HTTP over telehash for the common browser user-agent and web-app patterns.

## URI

The URI mapping for telehash is:

`thtp://851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6/path/resource.ext?query=arg`

It is identical to HTTP for the path and query string encoding, and instead of a hostname it is a hashname.

In browser rendering, the hashname can be shortened to "851042...27d3a6" visually. (TBD, how to show friendly nicknames for bookmarked/frequented/trusted hashnames)

All user-input URIs are always normalized before being processed (TBD).

The URI can also be `thtp:///path` which defaults to the current hashname in the context it is used.

## THTP Packet

Any HTTP request/response is normalized into a telehash packet by translating the headers into the JSON and any contents attached as the BODY.

The request: 

```
GET / HTTP/1.1
User-Agent: curl/7.30.0
Host: fooo.com
Accept: */*
```

Becomes:

```json
{
  "http":1.1,
  "get":"/",
  "user-agent":"curl/7.30.0",
  "host":"fooo.com",
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
  "http":1.1,
  "status":301,
  "server":"nginx",
  "date":"Fri, 07 Mar 2014 21:12:39 GMT",
  "content-type":"text/html",
  "content-length":178,
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

A new THTP request is initiated by creating a reliable channel of type `THTP`, multiples can be created simultaneously. In the request, the HTTP method is included as a lower-case key along with up to as much of the path as there is capacity for in the packet as the value, and any remaining space in the channel packet is used to include in the BODY as much of the THTP packet as possible.  This information is used by the recipient to determine if they want to accept the full request if it's larger than a single packet.

```json
{
  "c":1,
  "seq":0,
  "type":"THTP",
  "size":1234,
  "get":"/path/resource.ext"
}
```

If the request is accepted, an empty packet is sent back acknowledge the request and any remaining bytes of the THTP request are sent as the BODY in subsequent packets.  When the final one finishes the full THTP packet it will include a `"done":true`. Only one THTP packet can be sent on a channel until there's a response.

The response is the same pattern, a packet of the JSON headers and content bytes as the BODY, terminated by a `"done":true`.

The channel can be re-used for additional requests/responses (like HTTP keepalive), or those can be sent in parallel as their own channels.  To continue using the same channel the same pattern is used, a packet containing the size and the method:path keys is sent as a request along with as much of the THTP request will fit in the BODY, and once that packet is acknowledged, the full request/response can proceed.

If the initial request has a `"size":0` it is a *simple* request and there is no more information other than the given method and path.  The recipient should immediately return a normal THTP packet response.
