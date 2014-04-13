# `"type":"hb"` - HashBook, Minimal Ticket Caching

This is a very simplified version of the [buffer](buffer.md) to enable any hashname to cache a single ticket. Hashbook is limited by design in order to encourage wide support as a general purpose DHT directory service that needs few resources.

The `hb` channel is unreliable and only consists of a single request and response.  Only the last-received ticket is cached **per hashname**, and it should be cached as long as the recipient has capacity.  When resource limited the recipient should expire the oldest cached tickets.

To cache a ticket:

```json
{
  "c":1,
  "type":"hb",
  "store":"9d70ed00b508cb48e6630167e1a3c01f61fbe6e1722ec1cf36a23955c6ed6587"
}
BODY: ticket bytes
```

Upon success just an `"end":true` is returned and the attached ticket will replace any previous one from the sending hashname, otherwise an `"err":"reason"` is sent back to end the channel.  The `store` value along with the `BODY` must be stored for the sending hashname.  An empty BODY is a request to delete any already cached ticket.  
To retrieve a cached ticket:

```json
{
  "c":1,
  "type":"hb",
  "from":"4449fdac8562db31af3c45585a8dded840e9551062a6348489be2fa8d0f8d0b7",
  "read":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"
}
```
The `from` must match a stored ticket and the `read` value is 32 bytes (64 hex) that when SHA-256'd must match the `store` value for the ticket. Upon success the response will have an `"end":true` and the cached ticket attached as the BODY, if any. The cached ticket can be removed 10 seconds after sending (to allow for re-sending).

Both caching and retrieveing can be done in the same request. All store requests are rate-limited to no more than once every 10 seconds.
