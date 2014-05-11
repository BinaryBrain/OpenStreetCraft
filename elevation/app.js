// https://maps.googleapis.com/maps/api/elevation/json?key=AIzaSyBXFkS07m9sgtvCZT-KYtuiUJRxuADDjvU&sensor=false&locations=46.515289,6.632239
https = require('https');
fs = require('fs');
osmData = require('../osm-data.json');
ep = require('./encoded-polyline.js');

var squareSize = 1000; // 1000m
var DegreePerMeter = 111111;
var squareSizeDegree = squareSize/DegreePerMeter;
var elevationAPI = Math.floor(Math.sqrt(512));

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


function interpolateMap(jsonMap, keyMap) {
	resetKeyMap(jsonMap, keyMap);

	var rounds = ((squareSize/(elevationAPI-1))*0.75*10) | 0;
	
	//rounds = 1; // debug
	for(var i = 0; i < rounds; i++) {
		for(var x = 0; x <= squareSize; x++) {
			for (var y = 0; y <= squareSize; y++) {
				// moyenne
				var sum = 0; 
				var n = 0;

				if(x >= 1) {
					sum += jsonMap[x-1][y];
					n++;
				}
				if(x <= squareSize-1) {
					sum += jsonMap[x+1][y];
					n++;
				}
				if(y >= 1) {
					sum += jsonMap[x][y-1];
					n++;
				}
				if(y <= squareSize-1) {
					sum += jsonMap[x][y+1];
					n++;
				}

				jsonMap[x][y] = Math.round(sum/n);
			}
		}

		resetKeyMap(jsonMap, keyMap);
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

var locations = getLocationsToMeasure(osmData.minLatitude, osmData.minLongitude, osmData.maxLatitude, osmData.maxLongitude);

getElevationData(locations, function (data) {
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

		var json = JSON.stringify({ "elevation-flat": flatmap(jsonMap), mods: [] });

		console.log(json);

		//console.timeEnd('run');
	} else {
		console.error('error', data);
	}
});
