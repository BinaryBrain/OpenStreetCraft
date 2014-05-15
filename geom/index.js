exports.drawLine = function (x0, y0, x1, y1, cb) {
	var result = [];
	var dx = Math.abs(x1-x0);
	var dy = Math.abs(y1-y0);
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx-dy;

	while(true) {
		result.push({ x: x0, y: y0 });

		if(cb) {
			cb(x0, y0);
		}

		if(x0 === x1 && y0 === y1) {
			return result;
		}

		var e2 = 2*err;

		if(e2 > -dy) {
			err = err - dy
			x0 = x0 + sx
		}

		if(e2 < dx) {
			err = err + dx
			y0 = y0 + sy
		}
	}
}