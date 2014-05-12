var data = require('../data/OSMData.json');
var mapData = require('../data/map.json');


function setId(x,y,z,id) {
  var elevation = mapData['elevation-flat'][y + x * 1001];
  mapData.mods.push(x);
  mapData.mods.push(y);
  mapData.mods.push(z + elevation);
  mapData.mods.push(id);
  //console.log(x,y,z,id);
};

var WAYS = [];

function findOSLandmark() {
  for (var i = 0; i < data.way.length; ++i) {
   var way = data.way[i];

   if (way.tags.landuse || way.tags.leisure) {
      WAYS.push(way);
   }
  }
}

function generateForest(way) {
  var nodes = [];
  for (var i = 0; i < way.nodeRefs.length; ++i) {
    var node = data.node[way.nodeRefs[i]];
    nodes.push(node);
  }

  var sum = 0;
  var sum2 = 0;
  for (var i = 0; i < nodes.length - 1; ++i) {
    sum += nodes[i].lon * nodes[i + 1].lat;
    sum2 += nodes[i].lat * nodes[i + 1].lon;
  }
  sum += nodes[nodes.length - 1].lon * nodes[0].lat;
  sum2 += nodes[nodes.length - 1].lat * nodes[0].lon;
  

  var area = Math.abs(sum - sum2);

  var density = 0.1;

  var totalTree = density * area;

  var minX = nodes[0].lon;
  var maxX = nodes[0].lat;
  var minY = nodes[0].lon;
  var maxY = nodes[0].lat;

  for (var i = 0; i < nodes.length; ++i) {
    var n = nodes[i];

    if (n.lon < minX) {
      minX = n.lon;
    }
    if (n.lon > maxX) {
      maxX = n.lon;
    }

    if (n.lat < minY) {
      minY = n.lat;
    }
    if (n.lat > maxY) {
      maxY = n.lat;
    }
  }

  var areaW = maxX - minX;
  var areaH = maxY - minY;
  
  var i = 0;

  while (i < totalTree) {
    var x = Math.random() * areaW | 0;
    var y = Math.random() * areaH | 0;

    addTree(x + minX, y + minY);

    ++i;
  }

}

function addTree(x, y) {
  setId(x,y,1, 17);
  setId(x,y,2, 17);
  setId(x,y,3, 17);
  setId(x,y,4, 17);
  setId(x,y,5, 17);
  setId(x,y,6, 17);

  setId(x + 1,y,6, 18);
  setId(x - 1,y,6, 18);
  setId(x ,y + 1,6, 18);
  setId(x ,y - 1,6, 18);
  
  setId(x,y,7, 18);

  setId(x + 1,y,7, 18);
  setId(x - 1,y,7, 18);
  
  setId(x ,y + 1,7, 18);
  setId(x ,y - 1,7, 18);

  setId(x + 1,y - 1,7, 18);
  setId(x + 1 ,y + 1,7, 18);
  setId(x - 1,y - 1,7, 18);
  setId(x - 1 ,y + 1,7, 18);

  setId(x,y,8, 18);
  setId(x + 1,y,8, 18);
  setId(x - 1,y,8, 18);
  setId(x ,y + 1,8, 18);
  setId(x ,y - 1,8, 18);
  

  setId(x,y,9, 18);

}

function generateJson() {
   for (var i = 0; i < WAYS.length; ++i) {
     var way = WAYS[i];

     if (way.tags.landuse === 'forest') {
        generateForest(way);
     }
  }
}

findOSLandmark();
generateJson();

console.log(JSON.stringify(mapData));