# Local Area Networks

In order to support the goals of high resliliency, telehash needs to continue to operate on a LAN when no Internet connection is available.  Any switch supporting this must listen on *:42420 with broadcast enabled, and joined multicast address group "239.42.42.42".

Upon startup, a switch may send out broadcast and multicast announcements to port 42420 of a packet `"type":"lan"` and include a `"lan":"ab945f90f08940c573c29352d767fee4"` random 16 bytes hex encoded.  If any LAN seeds exist, they will broadcast back to port 42420 a packet of `"type":"seed"` and include the original `lan` value as well as their DER value as the body, sent from their main local listening port.  The switch receiving and validating this can then send them an open request directly, and if a line is established, include their information in a list of `local seeds`.

If no local seeds exist, and the switch is not able to connect to any other seeds or switches at all, it should continue to listen for any other incoming `lan` requests and respond to them.  If one or more others respond, the switch should not respond to any future incoming `lan` requests.

If a switch as a list of `local seeds` it shold *always* send them a seek request when it is trying to establish a connection with any hashname in case they are local.

A switch should also use the local seeds when looking for any `pool` resources.

### Bluetooth, WiFi Direct

This LAN pattern should work for Bluetooth ad WiFi Direct as well, but testing needs to happen first so details are TBD.