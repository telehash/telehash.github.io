# Physical Mesh Networks

Telehash has most of the functionality built in to facilitate the needs of a physical mesh network, where the content transmission itself must be routed over specific nodes in order to reach the destination.

When using `relay` and even `bridge` it's possible to accomplish end-to-end transmission when telehash is the mesh routing protocol, but it is not ideal or optimized for handling the physical mapping needs.

We need to have a mesh mode when any specific instance is deployed for that purpose, and methods for optimizing DHT and route discovery, bridging lines, etc when in mesh mode.