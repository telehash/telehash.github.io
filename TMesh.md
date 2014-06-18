TMesh - Telehash Mesh Networking
================================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

* one DHT for buckets
* transport provides hints for same-bucket prioritization
* mesh maintains all links based on config
* find is managed seeks
* find wont follow unknown routes when private (auto-adds them when public)
* seek is per hashname 
* auto-meshes when public, otherwise signals apps

seed is special mesh link, only relays, no bridge, throttles
seed link see is other seeds
peer link see is other peers, routes for that peer

