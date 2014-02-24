# `"type":"verb"` - Version Bargaining

While a switch handles all of the internal protocol versioning needed for telehash, larger applications frequently need to determine their own feature level version support dynamically.

The `verb` reliable channel enables any application to send it's list of minimum version requirements to another hashname and process a response of matches.  It uses the [semantic versioning](http://semver.org) rules and [semver](https://npmjs.org/doc/misc/semver.html) range/comparison syntax.

```json
{
  "c":"ab945f90f08940c573c29352d767fee4",
  "type":"verb",
  "verb":{
    "messaging":">0.1.1",
    "voice":">=1.0",
    "video":"0.2.x"
  },
  "seq":0
}
```

And a response will contain the exact supported versions (if any)

```json
{
  "c":"ab945f90f08940c573c29352d767fee4",
  "verbs":{
    "messaging":"0.4.2",
    "voice":"1.2.11"
  }
  "seq":0,
  "ack":0,
  "end":true
}
```

The use of this channel and the contained version keys is entirely application dependent, and an app should either have already had some context to know what kind of hashname it's sending a `verb` to, or it should include in the request it's own unique user agent such as `"myApp":">0.4"` in order to detect that the hashname is the same app.
