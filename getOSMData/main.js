// usage : node main.js 46.518709099999995 6.563243099999999
var osmread = require('osm-read');
var fs = require('fs');

if (process.argv.length < 5) {
    console.log('usage : node main.js 6.563243099999999 46.518709099999995 data/OSMData.json');
    return;
}

var DEG_TO_METER = 111111;
var ONE_METER = 0.000009; // number of deg in a meter
var SQUARE_SIZE = 500; // meters

var latitude = parseFloat(process.argv[2]);
var longitude = parseFloat(process.argv[3]);
var OUTPUT_JSON = process.argv[4];

var minLongitude = longitude - ONE_METER * SQUARE_SIZE;
var maxLongitude = longitude + ONE_METER * SQUARE_SIZE;

var minLatitude = latitude - ONE_METER * SQUARE_SIZE;
var maxLatitude  = latitude + ONE_METER * SQUARE_SIZE;

var OSM_DATA_BLOB = {
    longitude : longitude,
    latitude  :latitude,
    minLatitude : minLatitude,
    maxLatitude : maxLatitude,
    minLongitude : minLongitude,
    maxLongitude : maxLongitude,
    way : [],
    node : {},
    bounds : []
};

var url = 'http://api.openstreetmap.org/api/0.6/map?bbox=' + minLongitude+ ',' + minLatitude + ',' + maxLongitude + ',' + maxLatitude;

osmread.parse({
    //url: 'http://www.overpass-api.de/api/xapi?way[bbox=' + minLongitude+ ',' + minLatitude + ',' + maxLongitude + ',' + maxLatitude + ']',
    url: 'http://api.openstreetmap.org/api/0.6/map?bbox=' + minLongitude+ ',' + minLatitude + ',' + maxLongitude + ',' + maxLatitude,
    format: 'xml',
    endDocument: function() {
        writeJson(JSON.stringify(OSM_DATA_BLOB));
    },
    bounds: function(bounds){
        OSM_DATA_BLOB.bounds.push(bounds);
    },
    node: function(node){
        node.lon = (node.lon - minLongitude) * 111111 | 0;
        node.lat = (node.lat - minLatitude) * 111111 | 0;
        OSM_DATA_BLOB.node[node.id] = node;
    },
    way: function(way){
        OSM_DATA_BLOB.way.push(way);
    },
    error: function(msg){
        console.error('error: ' + msg);
    }
});

function writeJson(json) {
    fs.writeFile(OUTPUT_JSON, json, function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log("The file was saved as: "+OUTPUT_JSON);
        }
    }); 
}