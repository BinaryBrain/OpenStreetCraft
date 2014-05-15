var fs = require('fs');
var osmData = require('../data/OSMData.json');
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

function drawBuildings(osmData, map) {
	for(var i = 0, l = osmData.way.length; i < l; i++) {
		if(osmData.way[i].tags.building) {
			var refs = osmData.way[i].nodeRefs;
			var h = genarateHeight(50, 100);
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
	}

	//console.log(map);
	writeJson(JSON.stringify(map), function () {
		console.timeEnd('run');
	});
}

function drawBuildingColumns(columns, map) {
	for(var i = 0, l = columns.length; i < l; i++) {
		var prevColumn = (i === 0) ? columns.length-1 : i-1;
		var x0 = columns[prevColumn].x;
		var y0 = columns[prevColumn].y;
		var x1 = columns[i].x;
		var y1 = columns[i].y;
		var h = columns[i].h;

		var columns = geom.drawLine(x0, y0, x1, y1);
		var sum = 0;
		
		for (var i = 0, l = columns.length; i < l; i++) {
			var z = getElevation(map, columns[i].x, columns[i].y);
			sum += z;
		};

		var zAvg = sum/columns.length;

		columns.map(function (c) {
			return { x: c.x, y: c.y, z: c.z, h: c.h+zAvg }
		});

		drawColumn(columns, map);
	}
}

function drawColumn(column, map) {
	var blocks = [];
	var blockID = 1;
	
	for(var i = column.z; i <= column.h; i++) {
		//console.log(column.x, column.y, i, blockID);
		map.mods.push(column.x, column.y, i, blockID);
	}
}

function getElevation(map, x, y) {
	var z;
	if(map.elevation[x] && map.elevation[x][y]) {
		z = map.elevation[x][y];
	} else {
		z = 1;
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
		drawBuildings(osmData, map);
	});
});