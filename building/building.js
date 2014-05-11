var fs = require('fs');
var osmData = require('../data/OSMData.json');
var map = require('../data/map.json');

var squareSize = 1000;
var DegreePerMeter = 111111;

function drawBuildings(osmData, map) {
	for(var i = 0, l = osmData.way.length; i < l; i++) {
		if(osmData.way[i].tags.building) {
			var refs = osmData.way[i].nodeRefs;
			var h = genarateHeight(50, 100);
			var cols = [];

			for(var j = 0, k = refs.length; j < k; j++) {
				var lat = osmData.node[refs[j]].lat;
				var lon = osmData.node[refs[j]].lon;

				var x = lon;
				var y = lat;

				var z = getElevation(map, x, y);
				cols.push(x, y, z);
			}

			drawCols(cols, h);
		}
	}
}

function drawCols(cols, h) {
	for(var i = 0, l = cols.length; i < l; i++) {
		drawCol(cols[i])
	}
}

function drawCol(col, h) {
	var blocks = [];
	var blockID = 1;

	for(var i = col.z; i <= h; i++) {
		console.log(col.x, col.y, i, blockID);

		//map.mods.push(col.x, col.y, i, blockID);
	}
}

function getElevation(map, x, y) {
	var h = map.elevation[x][y];
	if(!h) console.log(x, y)
	return h;
}

function genarateHeight(min, max) {
	return Math.round(Math.random()*(max-min)+min)
}

drawBuildings(osmData, map);