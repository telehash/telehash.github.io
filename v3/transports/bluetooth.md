# Bluetooth

> this is a work-in-progress

The goal is to enable any device to discover, connect, and then send and receive encrypted packets over BLE.

## Advertising / Discovery

Consider using [UriBeacon](https://github.com/google/uribeacon/tree/master/specification) and the `urn:uuid:` to advertise when in discoverable mode.

## Connections

See [chunking](../chunking.md) for encoding packets as a series of PDUs.
