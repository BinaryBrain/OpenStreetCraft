

var data = require('./OSMData.json');

var WAYS = [];

function findOSMHighway() {
  for (var i = 0; i < data.way.length; ++i) {
   var way = data.way[i];
   if (way.tags.highway) {
      WAYS.push(way);
   }
  }

  console.log(WAYS);
}

findOSMHighway();

