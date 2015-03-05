# OIDC - OpenID Connect

[OpenID Connect](http://openid.net/connect/) can be used as the primary user/entity identification process for telehash, enabling a strongly encrypted communication medium to be easily coupled with standard identity management tools.

A hashname is a unique address associated with a specific software and/or hardware instance to enable encrypted communication, it is not intended to be used as an entity or end-user identity.  Once a hashname is generated in a new context, it can be registered and associated with other portable identities.

<a name="jwt" />
## Identity Tokens (JWT)

Any [JSON Web Token](http://tools.ietf.org/html/draft-ietf-oauth-json-web-token) can be automatically included as part of the [handshake process](e3x/handshake.md) between endpoints.  This enables applications to require additional context before deciding to establish a link or apply restrictions on to what can be performed over the link.

### Audience

When an [ID Token](http://openid.net/specs/openid-connect-basic-1_0.html#IDToken) is generated for one or more known hashnames, they must be included in the `aud` as one of the items in the array value.

### Scope

When a client is requesting to establish a link to an identity, it must include the scope value `link` during authorization.

### Claims

An identity may advertise its connectivity by including a `link` member in the [Standard Claims](http://openid.net/specs/openid-connect-basic-1_0.html#StandardClaims).  The value must be a valid [URI](../uri.md) that can be resolved to establish a link, and any resulting linked hashname must be included in the token's `aud` audience values.

## Discovery

Include the currently valid hashnames in the JWKs for [OpenID Connect Discovery](http://openid.net/specs/openid-connect-discovery-1_0.html).

