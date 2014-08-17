E3X - End-to-End Encrypted eXchange
===================================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

## Raw Brainstorming Notes

Defines:

* message encryption
* channel encryption
  * handshakes
  * keepalives
  * channel state
  * reliable channels
  * timeouts
* cipher-sets

Designed to expose all trust decisions to app layer, zero information or metadata is revealed to anything without explicit instructions from the app.

[E3X API](https://github.com/telehash/telehash-c/blob/master/src/e3x.h)


Handshake (Open) Wire Changes:

* handshake is keepalive, 3x handshake times out
* handshake contains IV now so same key+line means same session, new at is just validation
* handshakes received are always returned w/ same at
* new ones generated are sent w/ at w/ last bit matching our cid mask to guarantee unique
* same exchange must have increasing at's


