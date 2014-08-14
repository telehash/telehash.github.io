## DotPublic (`.public`) TLD

* Based on V2 DHT
* For *PUBLIC* only hashname-to-ip DNS resolution
* All hashnames and resolved IPs are public and observable by anyone
* Uses DHT to contact given hashname
* Uses hashname to handle any DNS requests (A, MX, TXT, SRV, etc)
* UDP only
* Only published hashnames may perform resolutions (client/private machines must always use a trusted public resolver proxy)
