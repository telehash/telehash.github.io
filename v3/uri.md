# URI handling for Out-Of-Band / Invite requests

This defines a URI format that any endpoint can use to encode temporary or permanent connectivity information for sending in an out-of-band medium.  Once a URI is resolved to an endpoint, that information (keys and paths) should be stored and used in place of the URI, a successful resolution only needs to be performed once.

A URI takes the form of: `protocol://user@canonical/session?csid=base32#token`

* `protocol` - should be defined or customized by the app so that it can install it's own handlers, defaults to `mesh` 
* `user@` - optional, only used to indicate a human-recognizable name that the URI is associated to within the app
* `canonical` - required, valid host name format (defaults to ip), may include optional `:port`
* `/session` - optional, opaque string of [unreserved characters](https://tools.ietf.org/html/rfc3986#section-2.3) used by the recipient to match to a particular session
* `?csid=base32` - optional, when a host name is used that has no mechanism for retrieving its public keys, they may be included as query string args
* `#token` - optional, opaque string of [unreserved characters](https://tools.ietf.org/html/rfc3986#section-2.3) used by the recipient to track a specific request

If supported, routers should always return a URI without a `#token` for the endpoint in the [link](channels/link.md) channel, and endpoints can add a `#token` before sharing the full URI.  Endpoints may also generate their own URI to themsevles if they have an accessible hostname and port available.

Processing:

1. validate canonical
2. do we know canonical already
3. can we resolve the canonical
4. issue a `peer` request to the canonical including `user`, `session`, and `token` attributes, only `token` is passed in `connect`
5. process any response handshake as the permanent resolution for this URI

## Canonical Host Keys

In order to send a handshake to the canonical host name given in a URI, its public keys must be known.  Each Cipher Set may be optionally included in the query string, and/or the keys may be shared via other standard lookup mechanisms to make the URIs shorter and easier.

### DNS

SRV records always resolve to a hashname-prefixed host, with TXT records returning all of the keys.

* `_mesh._udp.example.com. 86400 IN SRV 0 5 42424 uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g.example.com.` (also optionally support `_tcp` and `_http`, etc)
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN A 1.2.3.4`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "1a=base32"`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "2a=base32"`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "2a2=base32"`
* `uvabrvfqacyvgcu8kbrrmk9apjbvgvn2wjechqr3vf9c1zm3hv7g IN TXT "3a=base32"`

If a key's base32 encoding is larger than 250 characters, it is broken into multiple TXT records with the CSID being numerically increased so that it can be easily reassembled.

No other DNS record type is supported, only SRV records resulting in one or more A and TXT records.

### HTTP well-known

```
GET http://example.com/.well-known/mesh.json
{
  "keys":{...},
  "paths":{...}
}

### dotPublic

Routers may also use a [dotPublic](https://github.com/quartzjer/dotPublic) hostname instead of a registered domain name, which will internally resolve using public keys.

### Local Network

A hostname that is a local IPv4 or IPv6 network address may be sent a discovery request directly on that network.

## Connecting

With keys available, if the resolution of the canonical does not also result in `path` information and only an IP and Port are known, handshakes should be sent to that address in every transport supported that can use an IP and Port, including UDP, TCP, TLS, and HTTP(S).
