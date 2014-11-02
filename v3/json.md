Links JSON Format
=================

Many apps use JSON as the storage/exchange format for links.  This definition is just the common patterns, implementations may support additional keys/values.

Full example:

```js
  {
    "hashname": "frnfke2szyna2vwkge6eubxtnkj46rtctqk7g7ewbvfiesycbjdq",
    "admin": "http://telehash.org/"
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
    ]
  }
```

Only the `hashname` field is required, so that when stored in an array each object can be uniquely identified.

Definitions:

* `hashname` (required): The endpoint's hashname
* `admin`: A URL to identify the admin for the seed
* `keys`: The binary public keys for each cipher set in use, in base32
* `paths`: Array of path objects, as defined in [paths](channels/path.md).
