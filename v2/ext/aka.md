# AKA (Also-Known-As) - Multiple Hashnames

Any hashname may declaire itself to be equivilent to one or more other hashnames, such that the application may choose to interact with all of them identically or as a fallback mechanism.

An unreliable channel of type `aka` is used to both request and notify of any other equivilent hashnames.  It uses the pattern of a [see]() array of addresses to exchange the list of hashnames in priority sorted order.  There may be multiple packets if the list is long, and the start of a new channel is a reset of the authorative list of hashnames from the sender.

```json
{
  "c":1,
  "type":"aka",
  "see":["c6db0918a767f00b9841f4366ade7ffc13c86541c40bf0a1612e939988fdefb0,1a,184.96.145.75,59474"],
  "end":true
}
```

Upon receiving any new list of hashnames, an `aka` request must be sent to them and include the other hashname in order to be validated.

An `"aka":"hash value"` may be included on any link channel packet to indicate the hash of the current aka list for the sender.  The hash is a SHA256 of each string hashname in the see array in the order given.

A switch supporting AKAs must allow the app to specify the current list of other hashnames for itself, as well as provide a method to synchronize and return a sorted list of validated hashnames for any given one.

