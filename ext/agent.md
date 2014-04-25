# Agent - On-Behalf-Of

An `agent` is when one hashname is empowered to act as a trusted agent of another hashname through the use of a [ticket](tickets.md). This enables applications to use a more flexible mechanism to trust other dynamic instances without maintaining a list of current hashnames that represent another trusted entity.

When hashname *A* trusts *B*, then when *A* is contacted by an untrusted *C* hashname it can issue an `agent` request to *C* which will return a ticket issued by *B*, thereby making *C* a trusted agent of *B*.

The request to ask any hashname to actively verify their agency:

```json
{
  "c":1,
  "type":"agent",
  "trace":"be22ad779a631f63336fe051d5aa2ab2"
}
```

The receiving hashname must pass the `trace` and requesting hashname to it's one or more agencies to generate a new ticket.  Any returned one or more tickets are opaque and attached as the BODY on the same channel:

```json
{
  "c":1,
  "agency":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"
}
BODY: ticket from agency
```

Upon receiving a valid ticket from a trusted agency, the initial action that triggered the agent request may continue and/or the sending hashname may be stored as a trusted agent.

## Agency Tickets

The inner packet for an agent validation ticket contains only the returned trace string, and the hashname to be trusted as an agent for it.

```json
{
  "trace":"be22ad779a631f63336fe051d5aa2ab2"
  "agent":"c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0"
}
```
