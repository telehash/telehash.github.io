# JSON Web Key (JWK) to Hashname mapping

A [hashname](./) may be generated from keys encoded with [JOSE-JWK](https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-31#section-7.4) using simple mappings for the `ID` and `VALUE`.

## `"kty":"RSA"`

Each `VALUE` is the concatenation of the JSON `n` and `e` keys, in binary after base64 decoding.

The `ID` is mapped based on the RSA key size:

| bits | `ID` |
|------|:----:|
| 2048 | 0x83 |
| 3072 | 0x84 |
| 4096 | 0x85 |
| 5120 | 0x86 |
| 6144 | 0x87 |
| 7168 | 0x88 |
| 8192 | 0x89 |

## `"kty":"EC"`

Refer to [Elliptic Curve Registry](https://tools.ietf.org/html/draft-ietf-jose-json-web-algorithms-31#section-7.6).

Each EC `VALUE` is the concatenation of the JSON `x` and `y` keys, in binary after base64 decoding.

The `ID` is mapped based on the JSON `crv` key:

| `crv` | `ID` |
|-------|:----:|
| P-256 | 0x95 |
| P-384 | 0x96 |
| P-521 | 0x97 |


