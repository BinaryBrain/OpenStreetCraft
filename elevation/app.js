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

var locations = getLocationsToMeasure(osmData.minLatitude, osmData.minLongitude, osmData.maxLatitude, osmData.maxLongitude);

getElevationData(locations, function (data) {
	console.log(data)

	try {
		var data = JSON.parse(data);
		if(data.status = "OK") {
			for (var i = 0, l = data.results.length; i < l; i++) {
				var r = data.results[i];

				// DEV
				/*
				console.log('ELE: ', r.elevation);
				console.log('LOC: ', r.location.lat, r.location.lng);*/	
			}
		} else {
			console.error('error', data);
		}
	} catch (e) {
		console.error('error:', e);
	}
});