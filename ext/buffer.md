# `"type":"buffer"` - Lightweight asynchronous caching

Switches can support a simple buffering channel type to enable apps to support exchanging data asynchronously (when the sender/recipient aren't online at the same time).

A `buffer` channel is very simple, and switches can decide what parameters they want to support and for whom.

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

Once confirmed, the sender can then send that many packets on that channel and the BODYs are all cached with order preserved.

Anyone can read any buffer if they have the SHA256(store), the hash of the given store key, by creating a buffer channel with a `"read":"..."` attached (a buffer channel can only have a `store` or a `read`).  The stored BODYs are returned in order.

If a buffer is started with the same store value, it replaces the old one. Deleting is accomplished by starting with a count or expire of 0.

It is up to the creator to encrypt/determine the contents entirely.