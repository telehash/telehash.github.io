# Links

A `link` is the core connectivity mechanism between two endpoints.  An endpoint with one or more links is a `mesh`.

## Terminology

* **Link CSID** - The highest matching `CSID` between two endpoints
* **Link Keys** - The one or more `CSKs` of the other endpoint, at a minimum must include the `CSID` one
* **Link Paths** - All known or potential path information for connecting a link
* **Link Handshake** - A handshake that contains one `CSK` and the intermediate hashes for any others to validate the hashname and encrypt a response

## Link State

Links can be in three states:

* **unresolved** - at least the hashname is known, but either the Link Keys or Link Paths are incomplete
* **down** - keys have been validated and at least one path is available (possibly through router), but the link is not connected
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
        "hn": "e5mwmtsvueumlqgo32j67kbyjjtk46demhj7b6iibnnq36fsylka",
        "type": "peer"
      }
    ],
    "hashname": "frnfke2szyna2vwkge6eubxtnkj46rtctqk7g7ewbvfiesycbjdq"
  }
```

The `keys` object is always a dictionary of at least the single `CSID` for the link, with all string values being a [base32](hashname.md) encoding of the binary `CSK` for that given `CSID`.

The `paths` array is always the list of current or recent [path values](channels/path.md) and should contain only external paths when shared or a mix of both internal and external when used locally.

## Resolution

Links can be resolved from any string:

1. [JSON](#json)
2. [Direct URI](uri.md) (no fragment)
3. [Peer URI](uri.md) (router assisted, with fragment)
3. hashname - [peer](channels/peer.md) to default router(s)

Once resolved, preserve all paths for future use.  If resolved via a router, also generate and preserve a `peer` path referencing it.

<a name="handshake" />
## Handshake

The handshake packet is of `"type":"link"` and contains an optional `"csid":"1a"` for use when not sent as a message (such as in a [peer](channels/peer.md)).  The `BODY` of the handshake is another encoded packet that contains the sender's hashname details.

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
    "3a": "eg3fxjnjkz763cjfnhyabeftyf75m2s4gll3gvmuacegax5h6nia",
    "1a": "ckczcg2fq5hhaksfqgnm44xzheku6t7c4zksbd3dr4wffdvvem6q"
  }
  BODY: [2a's CSK binary bytes]
```

