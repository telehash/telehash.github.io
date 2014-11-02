NTP <> Telehash Bindings
=========================

Since telehash is frequently supporting mobile and device use cases, time synchronization is often an important issue. The [Network Time Protocol](http://en.wikipedia.org/wiki/Network_Time_Protocol) should be able to run natively on telehash as the packets can simply be attached as the BODY to a channel, but it may benefit from using `pool` and other aspects.

This is a living document to explore/add thoughts (send pull requests) on how best to use NTP over telehash.