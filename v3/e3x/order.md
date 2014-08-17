# Endpoint Order

In order to prevent conflicts between any two endpoints, uniqueness is guaranteed by comparing their public keys.

The binary value of each endpoint's public key is compared and they are placed in sorted order, such that the first endpoint to have a 1 when the other has a 0 is sorted higher.

The result of the comparison is a `HIGH` endpoint and a `LOW` endpoint that both mutually agree upon independently.
