# URI handling for Out-Of-Band requests

This defines a URI format that any endpoint can use to encode temporary or permanent connectivity information for sending in an out-of-band medium.  Once a URI is resolved to an endpoint, that information (keys and paths) should be stored and used in place of the URI, a successful resolution only needs to be performed once.

A URI takes the form of: `protocol://user@canonical/session#token`

* `protocol` - should be defined or customized by the app so that it can install it's own handlers, defaults to `mesh` 
* `user@` - optional, only used to indicate a human-recognizable name that the URI is associated to within the app
* `canonical` - required, valid host name format (defaults to ip), may include optional `:port`
* `/session` - optional, opaque string used by the recipient to match to a particular session
* `#token` - optional, opaque string used by the recipient to track a specific request

Routers return the base URI for the endpoint (if supported) in the [link](channels/link.md) channel, and endpoints can add a `#token`. The routers may also use [dotPublic](https://github.com/quartzjer/dotPublic) instead of a registered domain name.

Processing:

1. validate canonical
2. do we know canonical already
3. can we resolve the canonical
4. issue a `peer` request to the canonical including `user`, `session`, and `token` attributes, only `token` is passed in `connect`
5. process any response handshake as the permanent resolution for this URI

## DNS

SRV records always resolve to a hashname-prefixed host, with TXT records returning all of the keys.

* `_mesh._udp.example.com. 86400 IN SRV 0 5 42424 uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g.example.com.` (also optionally support `_tcp` and `_http`, etc)
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN A 1.2.3.4`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "1a=base32"`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "2a=base32"`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "2a2=base32"`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "3a=base32"`

If a key's base32 encoding is larger than 250 characters, it is broken into multiple TXT records with the CSID being numerically increased so that it can be easily reassembled.

No other DNS record type is supported, only SRV records resulting in one or more A and TXT records.

## HTTP well-known

```
GET http://example.com/.well-known/mesh.json
{
  "keys":{...},
  "paths":{...}
}