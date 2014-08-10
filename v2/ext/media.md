# Visual Audio SPatial In Realtime (VASPIR)

> this is just a raw note/draft area, a work in progress

Terminology:

* **Source** - a specific creator/device that is originating media (front camera, mic)
* **Stream** - a single type of data stream coming from one or more sources (mp4, opus)
* **Pipe** - a collection of sources and their streams for one purpose (call, meeting, broadcast)

## THTP

Uses THTP to get metadata:

* `/pipe` - fetch default one for a hashname
* `/pipe/:id` - fetch a specific pipe, returns all sources+streams definition
* `/stream/:id` - get a stream definition

## Pipe JSON

Pipe IDs are dynamic, and must be changed whenever any component source or stream is changed.

Defines all sources and their component streams.  Every stream must be fetched to determine support/options.

Sources are always friendly named to aid in debugging and verbose logging.

## Stream JSON

Generic container to define metadata for all formats.

## `"type":"mc"` - Media Control

General purpose pipe control channel.

* start is request to access a pipe, requires id
* optional id to provide context/permission
* send general capabilities to filter: video, audio, geo, capacity
* returns list of sources and their stream ids, use thtp to fetch profile of each
* each source can be requested to be paused, or signalled paused/closed state
* list of sources available, including adding new ones (screensharing)
* signal primary, composition hints


```json
{
  "src":{
    "vfront":[1,2,3],
    "vback":[4,5,6,7],
    "amic":[8,9],
    "sgps":[10],
    "vscreen":[11],
  },
  "mc":{
    "pause":"vback,sgps"
  },
  "comp":{
    "pair":"vscreen,vfront"
  }
}
```

Composition:

* must support "transfer" to a new pipe id
* ends pipe
* defines preference of primary/secondary sources of the same type
