var fs = require('fs');
var osmData = require('../data/OSMData.json');
var elevation = require('../data/elevation.json');

function getBuildings(osmData) {
	for(var i = 0, l = osmData.way.length; i < l; i++) {
		if(osmData.way[i].tags.building) {
			var refs = osmData.way[i].nodeRefs;

			for(var j = 0, k = refs.length; j < k; j++) {
				console.log(osmData.node[refs[j]]);
			}
		}
	}
}

getBuildings(osmData);