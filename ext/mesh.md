# Physical Mesh Networks

Telehash has most of the functionality built in to facilitate the needs of a physical (geographical) mesh network, where the content transmission itself must be routed over specific nodes in order to reach the destination. When using `relay` and `bridge` it's possible to accomplish full end-to-end transmission as the primary mesh routing protocol.

A telehash mesh network is always created and operated by a set of core mesh routers for the given mesh, and each router acts as a gateway to anyone that can reach it to any other hashname connected to any router on that mesh. The routers always maintain a line to every other router in the mesh, and always support bridging to each other or any hashname connected to the mesh.

A router always uses the `lan` extension to announce itself as a local discoverable seed.  In that role it can discover local hashnames and will be able to respond to any seek queries with the mesh routers closest to it.  When a new local hashname comes online it must be added to the mesh, and it's local router will send a `mesh` to the router closest to the new hashname to signal that it's joined the mesh.

The router handles seek queries and always returns an address of `851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6,mesh` for any router or mesh-connected hashname. The requesting switch should always seek again any closer mesh addresses.

When a new router is added to the mesh, or comes back online after being disconnected, as the line is established, any other router will re-send the `mesh` for any hashnames it is locally connected to to seed that router with the hashnames in the mesh closest to it.  When a router is disconnected, the inverse search happens, any local hashnames that were closest to it are then sent as a `mesh` to the next closest.

TBD:

* what the `mesh` request looks like
* how to maintain/timeout
* router/mesh trust
* scale issues for maintaining a larger mesh (university-size)
* how a regular switch best handles mesh addresses/paths