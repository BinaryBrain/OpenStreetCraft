// https://maps.googleapis.com/maps/api/elevation/json?key=AIzaSyBXFkS07m9sgtvCZT-KYtuiUJRxuADDjvU&sensor=false&locations=46.515289,6.632239
var https = require('https');
var fs = require('fs');
var ep = require('./encoded-polyline.js');
var argv = require('yargs').argv;

var INPUT_JSON;
var OUTPUT_JSON;

if (argv._.length >= 2) {
	INPUT_JSON = argv._[0];
	OUTPUT_JSON = argv._[1];
}
else {
	console.log('Error: missing argument: inputFile outputFile');
	return;
}

function getOSMData(cb) {
	fs.readFile(INPUT_JSON, 'utf8', function (err, data) {
		if (err) {
			console.error('Error: ' + err);
			return;
		}
		 
		data = JSON.parse(data);
		 
		cb(data);
	});
}

var squareSize = 1000; // 1000m
var DegreePerMeter = 111111;
var squareSizeDegree = squareSize/DegreePerMeter;
var elevationAPI = Math.floor(Math.sqrt(512));
var keySpace = Math.round(squareSize/elevationAPI);

function getElevationData(locations, cb) {
	var encoded = ep.createEncodings(locations);

	var options = {
		host: 'maps.googleapis.com',
		port: 443,
		path: '/maps/api/elevation/json?key=AIzaSyBXFkS07m9sgtvCZT-KYtuiUJRxuADDjvU&sensor=false&locations=enc:'+encoded,
		method: 'GET',
	};

	var req = https.request(options, function (res) {
	   var output = '';
		res.setEncoding('utf8');

		res.on('data', function (chunk) {
			output += chunk;
		});

		res.on('end', function() {
			// console.log(output);

			if(cb) {
				cb(output);
			}
		});
	});

	req.on('error', function(err) {
		console.log('error:', err.message);
	});

	req.end();
}

function getLocationsToMeasure(minLat, minLon, maxLat, maxLon) {
	var deltaLat = maxLat - minLat;
	var deltaLon = maxLon - minLon;

	var locations = [];
	var latSize = deltaLat/(elevationAPI-1);
	var lonSize = deltaLon/(elevationAPI-1);

	for(var i = 0; i < elevationAPI; i++) {
		for(var j = 0; j < elevationAPI; j++) {
			locations.push([ minLat+latSize*i , minLon+lonSize*j ]);
		}
	}

	return locations;
}

function toMeterMap(degMap) {
	meterMap = degMap.map(function (e) {
		return { x: e.x*DegreePerMeter, y: e.y*DegreePerMeter, z: e.z };
	}).map(function (e) {
		return { x: Math.round(e.x), y: Math.round(e.y), z: Math.round(e.z) }
	});

	// Normalizing

	var minX = findMinProp(meterMap, 'x');
	var minY = findMinProp(meterMap, 'y');
	var minZ = findMinProp(meterMap, 'z');

	meterMap = meterMap.map(function (e) {
		return { x: e.x - minX, y: e.y - minY, z: e.z - minZ};
	}).map(function (e) {
		return { x: e.x, y: e.y, z: e.z + 2 }
	});

	return meterMap;
}

function findMinProp(map, prop) {
	var lowest = Number.POSITIVE_INFINITY;
	var tmp;

	for(var i = 0, l = map.length; i < l; i++) {
		tmp = map[i][prop];
		
		if (tmp < lowest) {
			lowest = tmp;
		}
	}

	return lowest;
}

function initKeyMap(meterMap) {
	var keyMap = [];

	for(var x = 0; x < squareSize+1; x++) {
		keyMap.push([]);
	}

	for(var i = 0, l = meterMap.length; i < l; i++) {
		keyMap[meterMap[i].x][meterMap[i].y] = meterMap[i].z;
	}

	return keyMap;
}

function initJsonMap(keyAvg) {
	var jsonMap = [];

	for(var x = 0; x <= squareSize; x++) {
		jsonMap.push([]);

		for(var y = 0; y <= squareSize; y++) {
			jsonMap[x].push(keyAvg);
		}
	}

	return jsonMap;
}

function computeKeyAvg(keyMap) {
	var sum = 0;
	var n = 0;

	for(var x = 0, l = keyMap.length; x < l; x++) {
		for(var y = 0, g = keyMap[x].length; y < g; y++) {
			if(keyMap[x][y] !== undefined) {
				sum += keyMap[x][y];
				n++;
			}
		}
	}

	return sum/n;
}

function resetKeyMap(jsonMap, keyMap) {
	for(var x = 0; x <= squareSize; x++) {
		for (var y = 0; y <= squareSize; y++) {
			if(keyMap[x][y] !== undefined) {
				jsonMap[x][y] = keyMap[x][y];
			}
		}
	}

	return jsonMap;
}

function getPrevKeyX(keyMap, iniX, iniY) {
	for(var x = iniX-1; x >= 0; x--) {
		if(keyMap[x] !== undefined && keyMap[x][iniY] !== undefined) {
			return x;
		}
	}

	return 0
}

function getPrevKeyY(keyMap, iniX, iniY) {
	for(var y = iniY-1; y >= 0; y--) {
		if(keyMap[iniX][y] !== undefined) {
			return y;
		}
	}

	return 0
}

function getNextKeyX(keyMap, iniX, iniY) {
	for(var x = iniX+1; x <= squareSize; x++) {
		if(keyMap[x] !== undefined && keyMap[x][iniY] !== undefined) {
			return x;
		}
	}

	return 1000
}

function getNextKeyY(keyMap, iniX, iniY) {
	for(var y = iniY+1; y <= squareSize; y++) {
		if(keyMap[iniX][y] !== undefined) {
			return y;
		}
	}

	return 1000
}

function interpolateMap(jsonMap, keyMap) {
	for(var x = 0; x <= squareSize; x++) {
		for (var y = 0; y <= squareSize; y++) {
			var prevX = getPrevKeyX(x, y);
			var prevY = getPrevKeyY(x, y);
			var nextX = getNextKeyX(x, y);
			var nextY = getNextKeyY(x, y);

			var h1 = keyMap[prevX][prevY];
			var h2 = keyMap[nextX][prevY];
			var h3 = keyMap[prevX][nextY];
			var h4 = keyMap[nextX][nextY];

			var xx = x / (nextX - prevX);
			var yy = y / (nextY - prevY);

			var a00 = h1;
			var a10 = h2 - h1;
			var a01 = h3 - h1;
			var a11 = h1 - h2 - h3 + h4;

			h = a00 + a10 * xx + a01 * yy + a11 * xx * yy;

			jsonMap[x][y] = h | 0;
		}
	}

	return jsonMap;
}

function roundMap(jsonMap) {
	return jsonMap.map(function (e) {
		return e.map(function (f) {
			return f; // TODO: fast round
		})
	})
}

function createJsonMap(meterMap) {
	var keyMap = initKeyMap(meterMap);
	var keyAvg = computeKeyAvg(keyMap);
	var jsonMap = initJsonMap(keyAvg);

	jsonMap = interpolateMap(jsonMap, keyMap);

	return jsonMap;
}

function flatmap(array) {
	var flat = [];

	flat = flat.concat.apply(flat, array);

	return flat;
}

function writeJson(json) {
	fs.writeFile(OUTPUT_JSON, json, function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("The file was saved as: "+OUTPUT_JSON);
		}
	}); 
}

getOSMData(function (osmData) { 
	var locations = getLocationsToMeasure(osmData.minLatitude, osmData.minLongitude, osmData.maxLatitude, osmData.maxLongitude);

	getElevationData(locations, function (data) {
		console.time('run');

		var data = JSON.parse(data);
		if(data.status = "OK") {
			//console.time('run');

			var degMap = [];

			for (var i = 0, l = data.results.length; i < l; i++) {
				var r = data.results[i];

				degMap.push({ x: r.location.lng, y: r.location.lat, z: r.elevation });
			}

			var meterMap = toMeterMap(degMap);
			var jsonMap = createJsonMap(meterMap);

			var json = JSON.stringify({ elevation: jsonMap, "elevation-flat": flatmap(jsonMap), mods: [] });

			writeJson(json);

			console.timeEnd('run');
		} else {
			console.error('error', data);
		}
	});
});