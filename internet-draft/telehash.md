% Title = "telehash"
% abbrev = "telehash"
% category = "info"
% docName = "draft-miller-telehash-00"
% ipr= "trust200902"
% area = "Internet"
% workgroup = ""
% keyword = ["protocol", "telehash"]
%
% date
%
% [[author]]
% initials="J."
% surname="Miller"
% fullname="Jeremie Miller"
% #role="editor"
% organization = "Filament"
%   [author.address]
%   email = "jeremie@jabber.org"
%   [author.address.postal]
%   city = "Denver"

.# Abstract

The telehash protocol is designed to provide private, end-to-end encrypted communication over a variety of underlying transports, such as TCP, UDP, HTTP, or radio.  The unique address of each endpoint is formed from a fingerprint called a hashname, which universal address
• provides native tunneling of TCP/UDP sockets, HTTP, object streams, and more
• facilitates asynchronous and synchronous messaging and eventing
• supports an automatic peer discovery mode when available on local transports
• specifies a URI format for initiating new links out-of-band
• supports bridging and routing privately by default and optionally via a public DHT (draft)
• integrates native support for JSON Object Signing and Encryption (JOSE) and OpenID Connect


{mainmatter}

# Introduction

# Security Considerations


# References

<reference anchor="telehash"  target="http://telehash.org">
<front>
<title>telehash protocol v3.0</title>
<author fullname="Jeremie Miller" initials="J" surname="Miller">
</author>
<date month='April' day='7' year='2015' />

</front>
</reference>

{backmatter}

# Examples

This appendix provides some examples of the tmesh protocol operation.

```
   Request:


   Response:

```

[telehash]: http://telehash.org
