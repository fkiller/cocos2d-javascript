var sys = require('./sys');

exports.ccp = function(x, y) {
    return exports.pointMake(x, y);
};

exports.PointZero = function() {
    return ccp(0,0);
};

exports.rectMake = function(x, y, w, h) {
    return {origin: exports.pointMake(x, y), size: exports.sizeMake(w, h)};
};

exports.sizeMake = function(w, h) {
    return {width: w, height: h};
};

exports.pointMake = function(x, y) {
    return {x: x, y: y};
};

exports.rectContainsPoint = function(r, p) {
	return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width)
			&& (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
};

exports.pointEqualToPoint = function(point1, point2) {
	return (point1.x == point2.x && point1.y == point2.y);
};

exports.pointApplyAffineTransform = function(p, trans) {
	var newPoint = ccp(0, 0);
	
	newPoint.x = p.x * trans[0][0] + p.y * trans[1][0] + trans[2][0];
	newPoint.y = p.x * trans[0][1] + p.y * trans[1][1] + trans[2][1];

	return newPoint;
};
exports.affineTransformDeterminant = function(trans) {
	var det = 1,
		t = sys.copy(trans);

    var k, i, j, q, tkk;
	for (k = 0; k < 3; k++) {
		tkk = t[k][k];

		if (tkk == 0) {
			i = k;
			while (t[i][k] == 0) {
				if (i++ > 3) {
					return 0;
				}
			}

			// Swap t[i] and t[k]
			t[i] = t[i] + t[k]; t[k] = t[i] - t[k]; t[i] = t[i] - t[k];

			tkk = t[k][k];

			det *= -1;
		}

		for (i = k+1; i < 3; i++) {
			q = t[i][k] / tkk;
			for (j = k+1; j < 3; j++) {
				t[i][j] -= t[k][j] * q
			}
		}

		det *= tkk;
	}

	return det;
};
exports.affineTransformInvert = function(trans) {
	var newTrans = exports.affineTransformIdentity();

	var t = sys.copy(trans);

	var k, i, j, q, tkk;
	for (k = 0; k < 3; k++) {
		tkk = t[k][k];

		if (tkk == 0) {
			i = k;
			do {
				if (i++ > 3) {
					throw "Matrix not regular size";
				}
			} while (t[i][k] == 0);

			// Swap t[i] and t[k]
			t[i] = t[i] + t[k];
			t[k] = t[i] - t[k];
			t[i] = t[i] - t[k];
			newTrans[i] = newTrans[i] + newTrans[k];
			newTrans[k] = newTrans[i] - newTrans[k];
			newTrans[i] = newTrans[i] - newTrans[k];

			tkk = t[k][k];
		}

		for (i = 0; i < 3; i++) {
			if (i == k) {
				continue
			}

			q = t[i][k] / tkk;
			t[i][k] = 0;

			for (j = k+1; j < 3; j++) {
				t[i][j] -= t[k][j] * q;
			}
			for (j = 0; j < 3; j++) {
				newTrans[i][j] -= newTrans[k][j] * q;
			}
		}

		for (j = k+1; j < 3; j++) {
			t[k][j] /= tkk;
		}
		for (j = 0; j < 3; j++) {
			newTrans[k][j] /= tkk;
		}

	}

	return newTrans;
   
};

/**
 * Multiply 2 transform (3x3) matrices together
 */
exports.affineTransformConcat = function(trans1, trans2) {
	var newTrans = exports.affineTransformIdentity();

	var x, y, i;
	for (x = 0; x < 3; x++) {
		for (y = 0; y < 3; y++) {
			newTrans[y][x] = 0;
			for (i = 0; i < 3; i++) {
				newTrans[y][x] += trans1[y][i] * trans2[i][x];
			}
		}
	}

	return newTrans;
};

exports.degressToRadians = function(angle) {
	return angle / 180.0 * Math.PI;
};
exports.affineTransformTranslate = function(trans, x, y) {
	// tx = 6, ty = 7

	var newTrans = sys.copy(trans);
	newTrans[2][0] += x;
	newTrans[2][1] += y;

	return newTrans;
};

exports.affineTransformRotate = function(trans, angle) {
	// TODO
	return trans;
};

exports.affineTransformScale = function(trans, scale) {
	// TODO
	return trans;
};

exports.affineTransformIdentity = function() {
	return [[1, 0, 0],
		    [0, 1, 0],
		    [0, 0, 1]];
};
