# Hints Usage

Hints are a method for any switch to save out network connectivity information for a list of other hashnames so that upon a restart, the switch can very quickly bootstrap and reconnect.

The format used for storage should be identical to [seeds.json](seeds.md) and a switch should try to select the most useful hashnames to save state for.

## DHT

Minimally a swich should save the longest uptime hashnames from every bucket up to a [maximum](implementers.md#defaults).

## Local / Nearby

Any hashname that has a LAN IP address should be saved as a hint, up to a configurable [maximum](implementers.md#defaults).

If a switch is tracking response times to other hashnames, it should also save the fastest ones as hints.