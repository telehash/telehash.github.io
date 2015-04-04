# Links

A _link_ is the core connectivity mechanism between two endpoints. An endpoint managing one or more links is referred to as a _mesh_.

## Terminology

|                            |        |
|----------------------------|--------|
| **Link CSID**              | The highest matching `CSID` between two endpoints
| **Link Keys**              | The one or more `CSKs` of the other endpoint, at a minimum must include the `CSID` one
| **Link Paths**             | All known or potential path information for connecting a link
| **Link Handshake**         | A handshake that contains one `CSK` and the intermediate hashes for any others to validate the _hashname_ and encrypt a response

## Link State

Links can be in three states:

* **unresolved** - at least the hashname is known, but either the Link Keys or Link Paths are incomplete
* **down** - keys have been validated and at least one path is available (possibly through [_router_](routing.md)), but the link is not connected
* **up** - link has sent and received a handshake and is active

<a name="json" />
## JSON

Many apps use JSON as an easy storage/exchange format for defining and sharing link data.  The only required standard for this is that each link is an object with two fields, a `keys` object and a `paths` array.  Apps may extend and customize the JSON as needed but should attempt to preserve those two fields to simplify what other tools and libraries can automatically detect and generate.

It's common to have a `hashname` field as well for convenience or as the verified value if only one `CSK` is stored.

```js
  {
    "keys": {
      "1a": "aiw4cwmhicwp4lfbsecbdwyr6ymx6xqsli"
    },
    "paths": [
      {
        "ip": "192.168.0.55",
        "port": 61407,
        "type": "udp4"
      },
      {
        "peer": "e5mw...ylka",
        "type": "peer"
      }
    ],
    "hashname": "frnf...bjdq"
  }
```

The `keys` object is always a dictionary of at least the single `CSID` for the link, with all string values being a [base 32](base32.md) encoding of the binary `CSK` for that given `CSID`.

The `paths` array is always the list of current or recent [path values](channels/path.md) and should contain only external paths when shared or a mix of both internal and external when used locally.

<a name="jwk" />
## JSON Web Key (JWK)

The Link Keys can also be represented in a standard [JWK](https://tools.ietf.org/html/draft-ietf-jose-json-web-key-41) using a `kty` of `hashname`:

```json
{
    "kty": "hashname",
    "kid": "27yw...lwxa",
    "use": "link",
    "cs1a": "an7l...mzlm",
    "cs3a": "eg3fx...6nia"
}
```

The `kid` must always be the matching/correct hashname for the included keys.  The `use` value must always be `link` as it can only be used to create links.

The JWK may also contain a `"paths":[...]` array if required. Often the JWK is only used as [authority validation](uri.md#discovery) and does not require bundling of the current link connectivity information.

## Resolution

Links can be resolved from any string:

1. [JSON](#json)
2. [Direct URI](uri.md) (no fragment)
3. [Peer URI](uri.md#peer) ([router](routing.md) assisted, with fragment)
4. hashname - [peer request](channels/peer.md) to default [router(s)](routing.md)

Once resolved, all paths should be preserved for future use.  If resolved via a [router](routing.md) a `peer` type path should be preserved referencing that [router](routing.md).

<a name="handshake" />
## Handshake

In order to establish a link both endpoints must first send and receive an encrypted [_handshake_](e3x/handshake.md). The minimum required handshake packet is of `"type":"link"` and the `BODY` is another encoded packet that contains the sender's hashname details.
 
The attached packet must include the correct `CSK` of the sender as the `BODY` and the JSON contains the intermediate hash values of any other `CSIDs` used to generate the hashname.

Example:

```json
{
  "type":"link",
  "at":123456789,
  "csid":"2a"
}
BODY:
  {
    "3a": "eg3f...6nia",
    "1a": "ckcz...em6q"
  }
  BODY: [2a's CSK binary bytes]
```

The `"csid":"2a"` is optional when sent as an encrypted message, but required when sent in a [peer](channels/peer.md) channel.

<a name="jwt" />
## Identity (JWT)

The endpoints connected over a link are always uniquely identified by their hashnames which serve as a stable universally unique and verifiable address, but is not intended to be used as a higher level identity for an end-user or other entity beyond the single instance/device.  Once a hashname is generated in a new context, it should be registered and associated with other portable identities by the application.

[OpenID Connect](http://openid.net/connect/) or any service that is able to generate a [JSON Web Token](http://tools.ietf.org/html/draft-ietf-oauth-json-web-token) can be used for primary user/entity identification, enabling strongly encrypted communication to be easily coupled with standard identity management tools.

Just as a JWT is sent as a Bearer token over HTTP, it can be automatically included as part of the [handshake process](e3x/handshake.md) between endpoints with a `"type":"jwt"`.  This enables applications to require additional context before deciding to establish a link or apply restrictions on to what can be performed over the link once connected.

### Audience

When an [ID Token](http://openid.net/specs/openid-connect-basic-1_0.html#IDToken) is generated specifically for one or more known hashnames, the hashname must be included in the `aud` as one of the items in the array value.

### Scope

When a client is requesting to establish a new link to an identity, it must include the scope value `link` during authorization.

### Claims

An identity may advertise its connectivity by including a `link` member in the [Standard Claims](http://openid.net/specs/openid-connect-basic-1_0.html#StandardClaims).  The value must be a valid [URI](uri.md) that can be resolved to establish a link, and any resulting linked hashname must be included in the token's `aud` audience values.
