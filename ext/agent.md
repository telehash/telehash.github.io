# Agent - On-Behalf-Of

An `agent` is when one hashname is empowered to act as a trusted agent of another hashname through the use of a [ticket](tickets.md). This enables applications to use a more flexible mechanism to trust other dynamic instances without maintaining a list of current hashnames that represent another trusted entity.

When hashname *A* trusts *B*, then when *A* is contacted by an untrusted *C* hashname it can issue an `agent` request to *C* which will return a ticket issued by *B*, thereby making *C* a trusted agent of *B*.

The request to ask any hashname to actively verify their agency:

```json
{
  "c":1,
  "type":"agent",
  "agent":"be22ad779a631f63336fe051d5aa2ab2"
}
```

The receiving hashname must pass the `agent` and requesting hashname to it's one or more agencies to generate a new ticket.  Any returned one or more tickets are opaque and attached as the BODY on the same channel:

```json
{
  "c":1,
  "agency":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"
}
BODY: ticket from agency
```

Upon receiving a valid ticket from a trusted agency, the initial action that triggered the agent request may continue and/or the sending hashname may be stored as a trusted agent.
