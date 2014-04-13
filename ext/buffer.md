# `"type":"buffer"` - Lightweight asynchronous caching

Switches can support a simple buffering channel type to enable apps to support exchanging [tickets](tickets.md) asynchronously when the sender/recipient aren't online at the same time.

A `buffer` channel is reliable, and switches can decide what limits they want to support and for whom.

The request to create a buffer channel looks like:

```json
{
  "c":1,
  "type":"buffer",
  "store":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6",
  "expire":3600,
  "count":100
}
```

* **store** - a unique 32byte (64 hex) id as determined by the sender
* **expire** - number of seconds for the recipient to cache the buffer (from 0 to 2^16)
* **count** - maximum number of packets that will be sent in this buffer (from 0 to 2^8)

Once confirmed, the sender can then send that many tickets on that channel and the BODYs are all cached with order preserved.  The recipient can return an `"err":"reason"`, and if the reason is an expire/count limitation it can return the maximum allowed value along with the error.

Anyone can read any buffer if they have the source value the `store` hash was generated from by creating a buffer channel with a `"read":"..."` attached (a buffer channel can only have a `store` or a `read`).  The `read` must be a 32byte (64 hex) value that the SHA-256 of matches the `store`. Any stored BODYs are returned in order for that matching value.

If a buffer is started with the same store value, it replaces the old one. Deleting is accomplished by starting with a count or expire of 0.