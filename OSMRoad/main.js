var data = require('./OSMData.json');

function findOSMHighway(data) {
    var ways = [];
    for (var i = 0; i < data.way.length; ++i) {
        var way = data.way[i];
        if (way.tags.highway) {
            ways.push(way);
        }
    }
    return ways;
}

var ways = findOSMHighway(data);
console.log(ways);
