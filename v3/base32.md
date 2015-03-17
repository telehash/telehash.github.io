# Base 32

All base 32 encoding is defined by [RFC 4648](http://tools.ietf.org/html/rfc4648) with [no padding](http://tools.ietf.org/html/rfc4648#section-3.2) and always using the lower case alphabet of `abcdefghijklmnopqrstuvwxyz234567`.

It is used frequently to encode binary 32 byte [SHA-256](http://en.wikipedia.org/wiki/SHA-2) digests safely for use in JSON and URIs, resulting in a 52 character string, for example: `kw3akwcypoedvfdquuppofpujbu7rplhj3vjvmvbkvf7z3do7kkq`.  It is sometimes also used to encode public key material, small JSON objects, and print binary values for debugging.

Base 32 encoding was chosen to maximize compatibilty and consistency, such that it is usable in any part of a URI, as DNS labels, and is case insensitive and alphanumeric only. It's only used for small fixed values where interchanging the data safely is more important than efficency, it is never used to encode dynamic application data over a transport.

## Implementations

* [javascript](https://github.com/telehash/hashname) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/hashname.c)
* [c#](https://github.com/telehash/telehash.net/blob/master/Telehash.Net/Hashname.cs)
* [go](https://github.com/telehash/gogotelehash/tree/master/hashname)

Test Fixtures (hex <=> base32):

```json
{
  "666f6f20626172":"mzxw6idcmfza",
  ...
}
```
