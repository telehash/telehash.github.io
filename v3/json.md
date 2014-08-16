Seeds JSON Format
=================

Many apps/switches use JSON as the storage format for the list of seeds.  This definition is just the common patterns, some switches may support additional keys/values.

Full example:

```js
{
  "46fe53c258bbc1984fb5ab02ca1494eccdd54e9688dbbc2c882c8713f1cc4cf3":{
    "admin":"http://github.com/quartzjer",
    "paths":[{"type":"udp4","ip": "127.0.0.1","port": 42424},{"type":"http","http":"http://127.0.0.1"}],
    "keys":{
      "1a":"8jze4merv08q6med3u21y460fjdcphkyuc858538mh48zu8az39t1vxdg9tadzun",
      "2a":"621028hg1m30jam6923fe381040ga003g80gy01gg80gm0m2040g1c7bn5rdbmctf9qf56xvjf7d0faygd350fgpwy9baqg9e6ffhmmd2z0dytj6m6yn4cud1ny2nbv4qt7mn0fcper50zv4g1kavyv7mxm4tc06xhq33n8mzn80c6y6knyntvxfcnh1k9aftvrrb43b3vrh7eed3h117z4rqcruj3c38nyj6mdaudgdz6eph2wb2zzjf9h1c0tz9np4nbpvj42m5k192gqb36cgzvhchmzr3d4xutv3knw31h9g28bfbaawdexzrtc1cjdpx7yz6x9v2wjjhhettq1ehm457vf1r1kuqmynyvfkr5hhv3vf3dmwqxh03kruk0y2zve3h39a9d748raemkjg02avxcm3ktrd1jaxnbcup69m1u0e9kuq3mffj0g0cq3rqyjqyr2491820c0g008"
    }
  }
}
```

None of the fields are necessarily required, but at least `parts`, `paths` and one public key are needed to be useful as a seed entry.

Definitions:

* `admin`: A URL to identify the admin for the seed
* `keys`: The binary public keys for each cipher set used, in base64
* `parts`: The fingerprints of each included public key
* `paths`: Array of path objects, as defined in [paths](network.md#paths).
