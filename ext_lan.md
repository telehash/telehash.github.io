# Local Area Networks

In order to support the goals of high resliliency, telehash needs to continue to operate on a LAN when no Internet connection is available.

Upon startup, a switch may send out a broadcast (255.255.255.255) on port 42424 of a packet `"type":"lan"` and include a `"lan":"ab945f90f08940c573c29352d767fee4"` random 16 bytes hex encoded.  If any LAN seeds exist, they will respond with the identical packet back to your sending ip/port and also include their DER value as the body.  The switch can then send them an open request, and if a line is established, include their information in a list of `local seeds`.

If no local seeds exist, and the switch is not able to connect to any other seeds or switches at all, it should always become a local seed.

Any switch that is expecting to be always-on should support listening on 0.0.0.0:42424 for broadcast `lan` packets and respond approriately.

If a switch as a list of `local seeds` it shold *always* send them a seek request when it is trying to establish a connection with any hashname in case they are local.

A switch should also use the local seeds when looking for any `pool` resources.

### Bluetooth, WiFi Direct

This LAN pattern should work for Bluetooth ad WiFi Direct as well, but testing needs to happen first so details are TBD.