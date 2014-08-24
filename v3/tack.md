# TACK - Telehash Alias Canonical toKen

TACK is a globally unique resolvable identifier for use within any system that supports telehash.  It defines a URI format that any endpoint can use to exchange temporary or permanent connectivity information with any other.

The TACK takes the form: `tack:alias@canonical/token`

* `tack:` - fixed uri protocol
* `alias` - optional, friendly name
* `canonical` - required, valid host name format
* `token` - optional

The alias and token must be base32 encoded if they contain any binary or special characters (TBD) and prefixed with a + to indicate such.

Routers return their canonical name and one or more aliases if supported.  Any endpoint's hashname can be used as the canonical when local to a router, or as the alias when the router is canonical.

Token is used to generate tack's that can be uniquely tracked to authorize new connections or specify permissions.