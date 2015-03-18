# Base 32

All base 32 encoding is defined by [RFC 4648](http://tools.ietf.org/html/rfc4648) with [no padding](http://tools.ietf.org/html/rfc4648#section-3.2) and always using the lower case alphabet of `abcdefghijklmnopqrstuvwxyz234567`.

It is used frequently to encode binary 32 byte [SHA-256](http://en.wikipedia.org/wiki/SHA-2) digests safely for use in JSON and URIs, resulting in a 52 character string, for example: `kw3akwcypoedvfdquuppofpujbu7rplhj3vjvmvbkvf7z3do7kkq`.  It is sometimes also used to encode public key material, small JSON objects, and print binary values for debugging.

Base 32 encoding was chosen to maximize compatibilty and consistency, such that it is usable in any part of a URI, as DNS labels, and is case insensitive and alphanumeric only. It's only used for small fixed values where interchanging the data safely is more important than efficency, it is never used to encode dynamic application data over a transport.

## Implementations

* [javascript](https://github.com/telehash/hashname/blob/master/index.js#L16) (node and browserify)
* [c](https://github.com/telehash/telehash-c/blob/master/src/lib/base32.c)
* [c#](https://github.com/telehash/telehash.net/blob/master/Telehash.Net/Base32.cs)
* [go](https://github.com/telehash/gogotelehash/tree/master/internal/util/base32util)

Test Fixtures (hex <=> base32):

```json
{
    "": "",
    "66": "my",
    "666f": "mzxq",
    "666f6f": "mzxw6",
    "666f6f62": "mzxw6yq",
    "666f6f6261": "mzxw6ytb",
    "666f6f626172": "mzxw6ytboi",
    "666f6f62617262": "mzxw6ytbojra",
    "666f6f6261726261": "mzxw6ytbojrgc",
    "666f6f626172626178": "mzxw6ytbojrgc6a",
    "9f": "t4",
    "9fa9": "t6uq",
    "9fa9e0": "t6u6a",
    "9fa9e037": "t6u6any",
    "9fa9e03792": "t6u6an4s",
    "9fa9e0379247": "t6u6an4si4",
    "9fa9e0379247ca": "t6u6an4si7fa",
    "9fa9e0379247cad2": "t6u6an4si7fne",
    "9fa9e0379247cad2d3": "t6u6an4si7fnfuy",
    "9fa9e0379247cad2d395": "t6u6an4si7fnfu4v",
    "9fa9e0379247cad2d395ad": "t6u6an4si7fnfu4vvu",
    "9fa9e0379247cad2d395ad7e": "t6u6an4si7fnfu4vvv7a",
    "9fa9e0379247cad2d395ad7e61": "t6u6an4si7fnfu4vvv7gc",
    "9fa9e0379247cad2d395ad7e61c2": "t6u6an4si7fnfu4vvv7gdqq",
    "9fa9e0379247cad2d395ad7e61c215": "t6u6an4si7fnfu4vvv7gdqqv",
    "9fa9e0379247cad2d395ad7e61c215ad": "t6u6an4si7fnfu4vvv7gdqqvvu",
    "9fa9e0379247cad2d395ad7e61c215ad32": "t6u6an4si7fnfu4vvv7gdqqvvuza",
    "9fa9e0379247cad2d395ad7e61c215ad32f7": "t6u6an4si7fnfu4vvv7gdqqvvuzpo",
    "9fa9e0379247cad2d395ad7e61c215ad32f768": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2a",
    "9fa9e0379247cad2d395ad7e61c215ad32f76838": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2by",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382c": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byfq",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd4": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftka",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44c": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkey",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf0": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4a",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l4",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5a": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5na",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae7": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5noo",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae780": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaa",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae78088": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaei",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae780884a": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaeiji",
    "9fa9e0379247cad2d395ad7e61c215ad32f768382cd44cf03f5f5ae780884a98": "t6u6an4si7fnfu4vvv7gdqqvvuzpo2byftkez4b7l5nopaeijkma"
}

```
