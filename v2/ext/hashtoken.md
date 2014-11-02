Hash Tokens
===========

A hashtoken is a combination of a partial hashname and a token, such that they can be used to find, validate, and connect to any hashname.

The format is very simple: the first 16 bytes of the generator hashname, 8 bytes of random, and the first 8 bytes of the SHA-256 hash of the full 32 byte hashname concatenated with the 8 random bytes.  This results in 32 bytes, usually expressed as 64 lower case hex characters.

Any token can be used by any hashname to seek the DHT for it, and once it finds a hashname that matches the first 16 bytes, it can validate the token to be sure it has the correct hashname and then open a `token` channel to that hashname and pass in the token to notify the app that the token has been used:

```json
{
  "c":1,
  "type":"token",
  "token":"851042800434dd49c45299c6c3fc69ab427ec49862739b6449e1fcd77b27d3a6"
}
```

Upon receiving a token channel request the switch must either compare it to the list of tokens generated (if it stores them) or hand it to the application to validate.  It should then either return an error, or end the channel without error, acting as a signal to the sender about the validity of the token.

Once a token channel has been validated, whatever application behavior was tied to the token should then initiate on either side.
