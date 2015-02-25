# Endpoint Order

In order to prevent conflicts between any two endpoints, uniqueness is guaranteed by comparing the public keys of their agreed upon [cipher set](README.md).

The binary value of each endpoint's public key is compared and they are placed in high-to-low sorted order.
To achieve this the two public keys can be visited bit by bit, the first key that at a given position has a `1` (*higher*) where the other has a `0` (*lower*) is the one that has *higher* order.

Based on this comparison the two are labeled as `ODD` (*high*) endpoint and an `EVEN` (*low*) endpoint.

This mechanism ensures that that both endpoints will mutually agree on their label consistently and without communication.
