HTTP <> Telehash Bindings
=========================

This is a proposal for how to use HTTP over telehash for the common browser user-agent and web-server patterns.  It is designed for the HTML/webapp use case and is not optimal for REST or API style usage, as app-to-app data exchange can take better advantage of telehash natively.

## URI

The URI mapping for telehash is:

`thtp://851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6/path/resource.ext?query=arg`

It is identical to HTTP for the path and query string encoding, and instead of a hostname it is a hashname.

In browser rendering, the hashname can be shortened to "851042...27d3a6" visually. (TBD, how to show signed names like HTTPS, and how to show friendly nicknames for bookmarked/frequented/trusted hashnames)

All user-input URIs are always normalized before being processed (TBD).

## Requests

(very rough notes here!)

A request is initiated by creating a channel of type `thtp`, multiples can be created simultaneously. In the request, the HTTP method is included along with a SHA256 of the `/path/resource.ext` as well as another one of the query string if any.

Once the channel is confirmed (optional, the user-agent may opportunistically send the full request packets), the full request is sent as an attached packet with the JSON being the HTTP headers and the BODY being the content bytes if any.

The response is the same pattern, a packet of the JSON headers and content bytes as the BODY.

## Notes

There are many performance tweaks that can be added in parallelizing and prioritizing channels, controlling flow rates/feedback, and having the server pro-actively initiate reverse channels with the known resources included in "index" requests.
