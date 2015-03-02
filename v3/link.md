# Links

A `link` is the core connectivity mechanism between two endpoints.  An endpoint with one or more links is a `mesh`.

## Terminology

* **Link CSID** - The highest matching `CSID` between two endpoints
* **Link Keys** - The public key information about endpoint, at a minimum the bytes for the CSID and intermediate values for any others to validate the hashname
* **Link Paths** - The path information for connecting a link

## Link State

Links can be in three states:

* **unresolved** - at least the hashname is known, but either the Link Keys or Link Paths are incomplete
* **down** - keys have been validated and at least one path is available (possibly through router), but the link is not connected
* **up** - link has sent and received a handshake and is active

## Resolution

Links can be resolved from any string:

1. JSON - merge in json.md
2. URI - update peer channel to support generic link:"opaque"
3. hashname - use default router, generate uri and wait for handshake

Once resolved, perform paths and preserve all paths for future use (document auto-router-peer, gc duplicate old paths)
