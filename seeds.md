Seeds JSON Format
=================

Many apps/switches use JSON as the storage format for the list of seeds.  This definition is just the common patterns, some switches may support additional keys/values.

Full example:

```js
[{
    "paths":[{"type":"ipv4","ip": "127.0.0.1","port": 42424},{"type":"http","http":"http://127.0.0.1"}],
    "public": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxbxW60yf5pjlRIWxC4JioB0PQKBEttcLc8rALz7CKEgZKPvfG4ERQ1gpN54dx3DYC1jIsnmL6KKgdyq5hXtwpQqW5Y/UWWBAHaSEOgAaz1hAZaxCmPQi1mM7DwxTTW1iM8d6wcEWIR1Z28jlzyrACSmGKg+xbyvmU4NRr9lMhrueNltp+tiWwNyLG/4kzfwOhx1VP+mnrSxa7VziFLACMJxsC8sLPMkiLXlQHfTl+UICKf7vTeQQ0nRdgbnkdXCUPm3U6/ewDv3SdVn8BR1z2+n0qHbvHm4CiG78TBFStS/E+WE2x5U5yXJ8SUIcQoZa9tete9NCoF55LJzcyGBhuwIDAQAB",
    "hashname":"46fe53c258bbc1984fb5ab02ca1494eccdd54e9688dbbc2c882c8713f1cc4cf3"
}]
```

None of the keys are necessarily required, but at least `public` and `paths` are needed to be useful as a seed entry.

Definitions:

* `public`: The BER value of the public key (base64 of the DER).
* `paths`: Array of path objects, as defined in [paths](protocol.md#paths).
* `hashname`: The 64-character hex value (must match the `public` if included).
* `private`: Not used for seeds, but useful when using JSON to store the full hashname identity keypair.
* `pools`: Array of string names of what pools it supports.
