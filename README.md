OpenStreetCraft
===============

OpenStreetMap to Minecraft Map

# Specs

## JSON2Minecraft

```javascript
{
  "elevation": [[z, z, ..., z], [z, z, ..., z], ..., [z, z, ..., z]],
  "elevation-flat": [z, z, z, ...],
  "mods": [x, y, z, type, x, y, z, type, x, y, z, type, ...]
}

```

## OSM.json

```javascript
{
  "longitude" : longitude,
  "latitude"  : latitude,
  "minLatitude" : minLatitude,
  "maxLatitude" : maxLatitude,
  "minLongitude" : minLongitude,
  "maxLongitude" : maxLongitude,
  "bounds" : [{
    "minlat": 46.512997,
    "minlon": 6.624606,
    "maxlat": 46.521997,
    "maxlon": 6.633606
  }],
  "node" : {
    "321": { "tags": { ... },
      "id": "280609",
      "visible": true,
      "version":6,
      "changeset":9386137,
      "user": 'BinaryBrain',
       "uid": '42'
      "lat": 773,
      "lon": -216
    },
    "432": { ... }
  },
  "way" : {
    "123": { "tags": { ... },
       "nodeRefs": [ '321', '432' ],
       "id": '123',
       "visible": true,
       "version": 4,
       "changeset": 7865099,
       "user": 'BinaryBrain',
       "uid": '42'
    },
    "234": { ... }
  },
  relation : [
    {
      "tags": {
        "except": "bicycle",
        "restriction": "only_straight_on",
        "type": "restriction"
      },
      "members": {
      "nodes": [],
        "ways": [
          {"ref": "238239023", "role": "to"},
          {"ref": "8019802", "role": "from"},
          {"ref": "35297466", "role": "via"}
        ]
      },
      "id": "105752",
      "visible": true,
      "version": 3,
      "changeset": 19774307,
      "user": "Xinfe",
      "uid": "167945"
    },
    { ... }
  ]
}
```
