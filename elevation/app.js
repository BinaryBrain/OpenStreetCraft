// https://maps.googleapis.com/maps/api/elevation/json?key=AIzaSyBXFkS07m9sgtvCZT-KYtuiUJRxuADDjvU&sensor=false&locations=46.515289,6.632239

https = require("https")

function getElevationData(lat, lon, cb) {
	var options = {
		host: 'maps.googleapis.com',
		port: 443,
		path: '/maps/api/elevation/json?key=AIzaSyBXFkS07m9sgtvCZT-KYtuiUJRxuADDjvU&sensor=false&locations=46.515289,6.632239|46.511347,6.631939',
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

getElevationData(46.515289, 6.632239, function (data) {
	console.log(data);
	
	try {
		var data = JSON.parse(data);
		if(data.status = "OK") {
			for (var i = 0, l = data.results.length; i < l; i++) {
				var r = data.results[i];

				// DEV
				console.log('ELE: ', r.elevation);
				console.log('LOC: ', r.location.lat, r.location.lng);
			}
		} else {
			console.error('error', data);
		}
	} catch (e) {
		console.error('error:', e);
	}
})