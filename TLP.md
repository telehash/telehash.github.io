TLP - Telehash Line Protocol
============================

> see discussion at
> https://github.com/telehash/telehash.org/issues/57

VOCAB:

* switch: instance
* route: two hashnames (to and via), hints (csid, path)
* direct: parts, key, paths
* mode:
  * private: never respond to an open unless it was added via route/direct
  * public: allow any hashname to connect
  * discoverable: actively advertise on local networks and return any found
* packet: open, line, channel, message

TODO:

* a TLP implementation's role and responsibilities are minimal
* abstracts network transport, guarantees sender/recipient identity
* uses direct path information provided or simple routing rules only, always predictable
* 30 seconds is a fixed state change for all network paths (marked as inactive)
* any channel packets trigger an open and/or peer if no active paths
* all channels fail at 60sec based on the line inactivity
* packets are always sent to all active paths, one per transport
* opens can be announced on local transports automatically for faster local pathing
* each transport can go into discoverable mode, fires callback for all local peers existing/new
* when private, only open responds to known hashnames, requires adding first

A line keepalive is the last packet re-transmitted at least once every 30 seconds to signal the path(s) are still active.

A route is just another hashname that will connect a given hashname.

A switch must be given at least a route or a direct (path+parts+key) to try opening a channel to any hashname.
