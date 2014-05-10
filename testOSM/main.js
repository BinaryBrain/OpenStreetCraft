var osmread = require('osm-read');

var PROPERTY_VALUES = {};

osmread.parse({
    url: 'http://www.overpass-api.de/api/xapi?way[bbox=6.5594467,46.5101298,6.5794467,46.5301298]',
    format: 'xml',
    endDocument: function(){
        console.log(PROPERTY_VALUES);
    },
    bounds: function(bounds){
        //console.log('bounds: ' + JSON.stringify(bounds));
    },
    node: function(node){
        // console.log('node: ' + JSON.stringify(node));
    },
    way: function(way){
        // console.log('way: ' + JSON.stringify(way));
      //  console.log(way.tags);
        var key = '';
        for (var itemK in way.tags){
            key += itemK + '=' + way.tags[itemK] + ', ';
        }
        if (!PROPERTY_VALUES[key]) {
            PROPERTY_VALUES[key] = way;
        }
    },
    error: function(msg){
        console.log('error: ' + msg);
    }
});

