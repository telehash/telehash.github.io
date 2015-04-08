# Glossary

|                 |        |
|-----------------|--------|
| [channel][]              | a virtual stream that allows two _endpoints_ to exchange data reliably or unreliably
| [chunking][]             | a packet is _chunked_ into smaller pieces for low-MTU or streaming transports
| [cloaking][]             | method used to hide telehash traffic on the wire by randomizing all data sent
| [CS][]                   | *Cipher Set*, a collection of crypto algorithms with a given _CSID_
| [CSID][]                 | *Cipher Set ID*, predefined hex number identifying a _CS_
| [CSK][]                  | *Cipher Set Key*, the public key bytes for a given _CSID_
| [endpoint][]             | a participant in the telehash network identified by a single _hashname_
| [E3X][]                  | *End-to-End Encrypted eXchange*, a flexible encrypted exchange wire protocol
| [exchange][]             | the current encrypted session state between two endpoints
| [handshake][]            | _message_ type used to establish an encrypted _session_ for _channels_
| [hashname][]             | an _endpoint_ identifier, calculated from all of its _CSKs_
| [LOB][]                  | *Length-Object-Binary*, an encoding format that allows combining JSON and binary data
| [link][]                 | a connection between two _endpoints_ either directly or via a _router_
| [mesh][]                 | a number of _links_ with active encrypted _sessions_ over any _transport_; participants in the mesh are called _endpoints_
| [message][]              | an asynchronous encrypted packet between two _endpoints_
| [packet][]               | an encapsulation format for JSON and binary data using _length object binary (LOB)_ encoding
| [router][]               | an _endpoint_ that will facilitate link setup between two other endpoints
| [transport][]            | underlying network responsible for _packet_ transfer
| [URI][]                  | *Uniform Rescource Identifier*, to enable endpoints to share enough information (_hashname_, _transport_) for out-of-band connection setup and references

[channel]: channels/
[chunking]: chunking.md
[cloaking]: e3x/cloaking.md
[CS]: e3x/cs/
[CSID]: e3x/cs/
[CSK]: e3x/cs/
[endpoint]: link.md
[E3X]: e3x/intro.md
[exchange]: e3x/exchange.md
[handshake]: e3x/handshake.md
[hashname]: hashname.md
[LOB]: lob.md
[link]: link.md
[mesh]: mesh.md
[message]: e3x/messages.md
[packet]: lob.md
[router]: routing.md
[transport]: transports/
[URI]: uri.md
