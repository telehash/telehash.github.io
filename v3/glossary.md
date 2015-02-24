# Glossary

* _channel_ : **TODO: find good description for channel**
* _cloaking_ : method used to hides telehash traffic on the wire by randomizing all data sent
* _Cipher Set (CS)_ : a collection of crypto algorithms with a given _cipher set id (CSID)_
* _Cipher Set ID (CSID)_ : predefined hex number identifying a _cipher set (CS)_
* _endpoint_ : a participant in the telehash network identified by a **(TODO: or multiple?)** _hashname_
* _EVEN_ : the _endpoint_ with the numerically lower public key
* _e3x_ : End-to-End Encrypted eXchange is a flexible encrypted exchange protocol
* _exchange_ : **TODO: find good description for exchange**
* _handshake_ : _message_ type used to establish an encrypted _session_ for _channels_
* _hashname_ : an identifier for a participant of telehash, it is calculated from all public keys of the participants _cipher set (CS)_
* _LOB_ : Lenght-Oobject-Binary encoding format that allows combining JSON and binary data
* _link_ : **TODO: is this a term?**
* _mesh_ : a number of _links_ with active encrypted _sessions_ over any _transport_, participants in the mesh are called _endpoints_
* _message_ : an asynchronous encrypted packet between two endpoints
* _ODD_ : the _endpoint_ with the numerically higher public key
* _packet_ : an encapsulation format for JSON and binary data using _length object binary (LOB)_ encoding
* _router_ : **TODO: find good description for router**
* _session_ : **TODO: is this term used in telhash? If yes how could we describe it?**
* _transport_ : underlying layer responsible for _packet_ transfer
* _URI_ : is a special [Uniform rescource identifier](http://en.wikipedia.org/wiki/Uniform_resource_identifier) format that allows _endpoints_ to convey information about themselves to others. **TODO: find a better definition**
