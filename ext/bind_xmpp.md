XMPP <> Telehash Bindings
=========================

This is a proposal for how to use telehash from existing Jabber/XMPP clients.  It documents mechanisms for the clients to discover the hashname(s) being used by other JIDs in a user's roster, and how to then use telehash to connect directly/securely.

## Hashname Discovery

Any client that supports telehash MUST send it's current hashname using [XEP-0152](http://xmpp.org/extensions/xep-0152.html) in a URI defined by [RFC 6920](https://datatracker.ietf.org/doc/rfc6920/):

```xml
<presence from='juliet@capulet.lit/balcony'>
  <reach xmlns='urn:xmpp:reach:0'>
    <addr uri='ni:///sha-256;851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6'/>
  </reach>
</presence>
```

Since not all interactions between clients require presence to have been exchanged, when a client sends a message to a JID that it has not received presence for, it MAY include it's hashname there as well:

```xml
<message
    from='romeo@montague.lit/garden'
    to='juliet@capulet.lit/balcony'>
  <body>V unir avtug'f pybnx gb uvqr zr sebz gurve fvtug</body>
  <reach xmlns='urn:xmpp:reach:0'>
    <addr uri='ni:///sha-256;851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6'/>
  </reach>
</message>
```

Upon receiving any presence or message stanza that includes a new hashname, that value is then cached associated with the specific JID it came from (including the resource).

If a user has a default or primary/only client that supports telehash, it MAY include that hashname in the `<URL>ni:///sha-256;851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6</URL>` field in the user's stored vcard.

## Private Messaging

(rough notes here)

Once any client has one or more hashnames for a JID, it can then initiate a private message channel to them via telehash. In telehash, this channel type is "urn:xmpp:message".

Upon receiving a channel request, the initiating hashname must match one that has already been discovered via incoming stanzas so that the sending JID can be validated. With no match, an error message of "unknown sender" is returned and the requesting client MAY send a regular message stanza with it's hashname via XMPP.

(TBD) The telehash message channel carries the same XML message stanzas as would be sent via XMPP in the BODY attachments to each packet.

(TBD) An optional telehash channel of just "message" MAY be supported as well, where the contents are defined in JSON.

When there's multiple hashnames known, the channel request should be sent to all of them, and the one that responds is where messages are then sent/received.

## File Transfers

(TBD) Similar pattern to messaging.

## Voice/Video Streaming

(TBD)
