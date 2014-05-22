var fs = require('fs');
var argv = require('yargs').argv;
var geom = require('../geom');

var INPUT_OSM_JSON;
var INPUT_MAP_JSON;
var OUTPUT_JSON;

if (argv._.length >= 3) {
	INPUT_OSM_JSON = argv._[0];
	INPUT_MAP_JSON = argv._[1];
	OUTPUT_JSON = argv._[2];
}
else {
	console.log('Error: missing argument: inputOSMFile inputMapFile outputFile');
	return;
}

function getFile(filename, cb) {
	fs.readFile(filename, 'utf8', function (err, data) {
		if (err) {
			console.error('Error: ' + err);
			return;
		}
		
		data = JSON.parse(data);
		
		cb(data);
	});
}

var squareSize = 1000;
var DegreePerMeter = 111111;

function getWays(osmData) {
	var ways = [];

	// Ways
	Object.keys(osmData.way).forEach(function(key) {
		var way = osmData.way[key];

		if(way.tags.building) {
			ways.push(way);
		}
	});

	// Relations
	for(var i = 0, l = osmData.relation.length; i < l; i++) {
		if(osmData.relation[i].tags.building) {
			var wayRefs = osmData.relation[i].members.ways;

			for(var j = 0, k = wayRefs.length; j < k; j++) {
				var way = osmData.way[wayRefs[j].ref];

				if(way) {
					ways.push(way);
				}
			}
		}
	}

	return ways;
}

function drawBuildings(osmData, ways, map) {
	for(var i = 0, l = ways.length; i < l; i++) {
		var refs = ways[i].nodeRefs;
		var h = genarateHeight(10, 20);
		var columns = [];

		var zSum = 0;

		for(var j = 0, k = refs.length; j < k; j++) {
			var lat = osmData.node[refs[j]].lat;
			var lon = osmData.node[refs[j]].lon;

			var x = lon;
			var y = lat;

			columns.push({ x: x, y: y, z: 0, h: h });
		}

		drawBuildingColumns(columns, map);
	}

	//console.log(map);
	writeJson(JSON.stringify(map), function () {
		console.timeEnd('run');
	});
}

function drawBuildingColumns(columns, map) {
	var sum = 0;
	var n = 0;
	var walls = [];
	
	for(var i = 1, l = columns.length; i < l; i++) {
		var prevColumn = i-1;

		var x0 = columns[prevColumn].x;
		var y0 = columns[prevColumn].y;
		var x1 = columns[i].x;
		var y1 = columns[i].y;
		var h = columns[i].h;

		geom.drawLine(x0, y0, x1, y1, function (x, y) {
			var z = getElevation(map, x, y);

			if(z) {
				sum += z;
				n++;	
			} else {
				z = 1;
			}

			walls.push({ x: x, y: y, z: z, h: h });
		});
	}

	var zAvg = Math.round(sum/n);

	walls = walls.map(function (c) {
		return { x: c.x, y: c.y, z: c.z, h: c.h+zAvg }
	});

	for (var i = 0, l = walls.length; i < l; i++) {
		drawColumn(walls[i], map);
	}
}

function drawColumn(column, map) {
	var blocks = [];
	var blockID = 1;
	
	for(var i = column.z; i <= column.h; i++) {
		map.mods.push(column.x, column.y, i, blockID);
	}
}

function getElevation(map, x, y) {
	var z;
	if(map.elevation[x] && map.elevation[x][y]) {
		z = map.elevation[x][y];
	} else {
		z = undefined;
	}

	return z;
}

function genarateHeight(min, max) {
	return Math.round(Math.random()*(max-min)+min);
}

function writeJson(json, cb) {
	fs.writeFile(OUTPUT_JSON, json, function(err) {
		if(err) {
			console.error(err);
		} else {
			console.log("The file was saved as: "+OUTPUT_JSON);
		}

		if(cb) {
			cb();
		}
	}); 
}

console.time('run');

getFile(INPUT_OSM_JSON, function(osmData) {
	getFile(INPUT_MAP_JSON, function (map) {
		drawBuildings(osmData, getWays(osmData), map);
	});
});