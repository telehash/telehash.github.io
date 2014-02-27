HTTP <> Telehash Bindings
=========================

This is a proposal for how to use HTTP over telehash for the common browser user-agent and web-app patterns.

## URI

The URI mapping for telehash is:

`thtp://851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6/path/resource.ext?query=arg`

It is identical to HTTP for the path and query string encoding, and instead of a hostname it is a hashname.

In browser rendering, the hashname can be shortened to "851042...27d3a6" visually. (TBD, how to show friendly nicknames for bookmarked/frequented/trusted hashnames)

All user-input URIs are always normalized before being processed (TBD).

## Requests

(very rough notes here!)

A request is initiated by creating a reliable channel of type `thtp`, multiples can be created simultaneously. In the request, the HTTP method is included along with a SHA256 of the `/path/resource.ext` as well as another one of the query string if any. Up to the first 512 bytes of the full (normalized) URI is also included, so that between that and the hash values the recipient can decide if they want to accept the request.

Once the channel is opened, the full request is sent as an attached THTP packet with the JSON being the HTTP headers and the BODY being the content bytes if any. If the request packet is larger than 1k it is spread across multipe channel packets as the BODY and when the final one contains the full THTP packet it will include a `"done":true`. Only one THTP packet can be sent on a channel until there's a response.

The response is the same pattern, a THTP packet of the JSON headers and content bytes as the BODY, terminated by a `done`.

## Notes

There are many performance tweaks that can be added in parallelizing and prioritizing channels, controlling flow rates/feedback, and having the server pro-actively initiate reverse channels with the known resources included in "index" requests.
